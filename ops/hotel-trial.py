import argparse
import fcntl
import hashlib
import json
import os
import subprocess
import tarfile
import tempfile
from pathlib import Path


def run(*args, cwd=None, output=False):
    return subprocess.run(args, cwd=cwd, check=True, capture_output=output, text=True).stdout


def revision(source):
    return run("git", "-c", f"safe.directory={source}", "-C", source,
               "rev-parse", "--verify", "HEAD^{commit}", output=True).strip()


def release_at(site, name):
    target = site / name
    return Path(os.readlink(target)).name if target.is_symlink() else None


def point_to(site, name, sha):
    pending = site / (name + ".next")
    pending.unlink(missing_ok=True)
    pending.symlink_to(Path("releases") / sha, target_is_directory=True)
    pending.replace(site / name)


def build(root, source, sha):
    site = root / "site"
    release = site / "releases" / sha
    if release.is_dir():
        return
    cache = root / "cache"
    with tempfile.TemporaryDirectory(dir=cache, prefix="build-") as temp:
        work = Path(temp)
        archive = work / "source.tar"
        run("git", "-c", f"safe.directory={source}", "-C", source, "archive",
            "--output", archive, sha)
        with tarfile.open(archive) as bundle:
            bundle.extractall(work, filter="data")
        archive.unlink()
        digest = hashlib.sha256((work / "package-lock.json").read_bytes()).hexdigest()
        deps = cache / ("deps-" + digest)
        modules = work / "node_modules"
        if deps.exists():
            deps.rename(modules)
        else:
            run("npm", "ci", "--no-audit", "--no-fund", cwd=work)
        try:
            run("npm", "run", "build:pages", cwd=work)
            run("node", "--test", "tests/pages-export.test.mjs", cwd=work)
            output = work / "showcase" / "out"
            if any(p.is_symlink() or not (p.is_file() or p.is_dir()) for p in output.rglob("*")):
                raise ValueError("Only static files and directories can be published")
            output.rename(release)
        finally:
            if modules.is_dir():
                modules.rename(deps)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=["preview", "publish", "rollback", "status"])
    parser.add_argument("revision", nargs="?")
    args = parser.parse_args()
    root = Path(os.environ["HOTEL_TRIAL_ROOT"]).resolve()
    source = root / "source"
    site = root / "site"
    with (root / "cache" / "operation.lock").open("a") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        draft = release_at(site, "draft")
        live = release_at(site, "live")
        previous = release_at(site, "previous")
        if args.action == "preview":
            sha = revision(source)
            build(root, source, sha)
            point_to(site, "draft", sha)
        elif args.action == "publish":
            if not draft or args.revision != draft:
                parser.error("Pass the full revision of the reviewed draft")
            if live != draft:
                if live:
                    point_to(site, "previous", live)
                point_to(site, "live", draft)
        elif args.action == "rollback":
            if not previous or not live or args.revision != live:
                parser.error("Pass the full current live revision; a previous release is required")
            point_to(site, "live", previous)
            point_to(site, "previous", live)
        print(json.dumps({name: release_at(site, name) for name in ("draft", "live", "previous")}))


if __name__ == "__main__":
    main()
