import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


@unittest.skipIf(os.name != "posix", "Linux release directories")
class HotelTrial(unittest.TestCase):
    def test_only_reviewed_draft_can_be_published_and_rollback_restores_previous(self):
        script = Path(__file__).resolve().parents[1] / "ops" / "hotel-trial.py"
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            site = root / "site"
            (site / "releases").mkdir(parents=True)
            (root / "cache").mkdir()
            def call(*args, success=True):
                proc = subprocess.run([sys.executable, script, *args], env={**os.environ, "HOTEL_TRIAL_ROOT": temp},
                                      text=True, capture_output=True)
                self.assertEqual(proc.returncode == 0, success, proc.stderr)
                return json.loads(proc.stdout) if success else None

            first, second = "a" * 40, "b" * 40
            for rev in (first, second):
                (site / "releases" / rev).mkdir()
            (site / "draft").symlink_to("releases/" + first)
            call("publish", first)
            (site / "draft").unlink()
            (site / "draft").symlink_to("releases/" + second)
            call("publish", first, success=False)
            self.assertEqual(call("status")["live"], first)
            self.assertEqual(call("publish", second)["previous"], first)
            call("rollback", first, success=False)
            self.assertEqual(call("rollback", second)["live"], first)
