type Service = 'telegram' | 'max' | 'maps'

export default function ContactIcon({ service }: { service: Service }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {service === 'telegram' && <path d="M2.8 10.6 21 3.4l-3.1 17.1-6.3-4.8-3.4 2.9.5-5.4 8-6.2-9.6 5.1z" />}
      {service === 'max' && <>
        <path d="M4 20.5l.8-4.2a8.5 8.5 0 1 1 4.2 3.5z" />
        <path d="M8.2 12.2a4 4 0 1 1 4 4 3.8 3.8 0 0 1-1.7-.4l-2 .6.3-2a4 4 0 0 1-.6-2.2z" />
      </>}
      {service === 'maps' && <>
        <path d="M19.3 10c0 5.2-7.3 11-7.3 11s-7.3-5.8-7.3-11a7.3 7.3 0 1 1 14.6 0z" />
        <circle cx="12" cy="10" r="2.7" />
      </>}
    </svg>
  )
}
