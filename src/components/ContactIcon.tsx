const silhouettes = {
  telegram: 'M20.9 3.5 3 10.4c-.9.3-.9 1 .1 1.3l4.6 1.5L17.9 7l-8.2 7.7 6.8 5.1c.8.5 1.5.3 1.7-.6l3.5-14.7c.2-.9-.2-1.3-.8-1z',
  max: 'M12.2 2.2a9.7 9.7 0 0 0-9.7 9.7c0 3.4 1.4 5.5 1.4 8.4 0 1 .4 1.5 1.4 1.3a6.8 6.8 0 0 0 2.7-1.4 9.7 9.7 0 1 0 4.2-18zm0 5a4.8 4.8 0 1 1-2.6 8.9l-1.4 1c-.7-1.2-.9-3.3-.9-5.1a4.9 4.9 0 0 1 4.9-4.8z',
  maps: 'M12 2a8 8 0 0 0-8 8c0 5.4 6.8 11.6 7.6 12.3a.6.6 0 0 0 .8 0C13.2 21.6 20 15.4 20 10a8 8 0 0 0-8-8zm0 5.2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6z',
}

export default function ContactIcon({ service }: { service: keyof typeof silhouettes }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={silhouettes[service]} fillRule="evenodd" />
    </svg>
  )
}
