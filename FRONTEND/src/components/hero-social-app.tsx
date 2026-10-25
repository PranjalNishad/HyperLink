'use client'

/**
 * Homepage hero — Tokokino's landing composition, tailored to HyperLink.
 *
 * Structure follows the reference: a centred column (badge → headline →
 * copy → CTA pair) above a framed product visual, inside the dashed rails.
 * The frame is the reference's mockup shell — 20px outer shell, corner ticks,
 * browser-chrome bar with traffic-light dots and a mono label, and a 42px
 * grid canvas behind a radial mask — with HyperLink's real shortener living
 * inside it instead of a static screenshot. The tilted sample cards keep the
 * UI Layouts `hero-social-app` personality around the frame.
 */

import { type CSSProperties, type FormEvent, useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, Copy, ExternalLink, Link2 } from 'lucide-react'
import { TimelineAnimation } from '@/components/ui/timeline-animation'
import { createShortUrl } from '@/api/shortUrl.api'
import { initAuthState, subscribeAuthState } from '@/utils/authState'

const benefits = ['Fast & Simple', 'Click Analytics', 'Secure & Reliable', 'Custom Links']

const reveal = (index: number): CSSProperties => ({ '--reveal-i': String(index) } as CSSProperties)

const chromeDot = (className: string) => (
  <span className={`block size-2.5 rounded-full ${className}`} aria-hidden="true" />
)

export const HeroSocialApp = () => {
  const timelineRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [shortUrl, setShortUrl] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [ctaHref, setCtaHref] = useState('/signup')

  // Reuse the shared, single auth probe (no second request of our own).
  useEffect(() => {
    initAuthState()
    return subscribeAuthState((authed) => setCtaHref(authed ? '/dashboard' : '/signup'))
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = url.trim()

    if (!value) {
      setError('Please enter a URL to shorten.')
      setStatus('error')
      inputRef.current?.focus()
      return
    }

    setStatus('loading')
    setError('')
    setCopied(false)

    try {
      const result = await createShortUrl(value)
      setShortUrl(result.shortUrl)
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  async function handleCopy() {
    if (!shortUrl) return
    try {
      await navigator.clipboard.writeText(shortUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy to clipboard. Please copy it manually.')
    }
  }

  const isLoading = status === 'loading'

  return (
    <section
      id="hero"
      ref={timelineRef}
      className="relative overflow-hidden px-4 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:px-12"
    >
      <div className="container-wide relative">
        <TimelineAnimation
          animationNum={0}
          timelineRef={timelineRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 h-full w-8 hidden bg-[repeating-linear-gradient(135deg,rgba(255,93,110,0.14)_0px_1px,transparent_1px_10px)] md:block md:w-14"
        />
        <TimelineAnimation
          animationNum={0}
          timelineRef={timelineRef}
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 hidden h-full w-8 bg-[repeating-linear-gradient(135deg,rgba(255,93,110,0.14)_0px_1px,transparent_1px_10px)] md:block md:w-14"
        />

        <div className="home-reveal mx-auto flex w-full flex-col items-center gap-8 text-center">
          {/* Badge */}
          <a
            href="#hero"
            className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border border-[var(--color-border)] bg-[var(--frame-fill)] px-3 py-1 font-mono text-[10px] tracking-[0.16em] uppercase backdrop-blur-sm transition-colors hover:border-[var(--color-border-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-active)]"
          >
            <span className="block size-1.5 rounded-full bg-[var(--color-primary)]" aria-hidden="true" />
            <span className="text-[var(--color-primary)]">Custom domains live</span>
            <span className="text-[var(--color-text-subtle)]">hyperlink.pranjalnishad.in</span>
          </a>

          {/* Headline */}
          <h1 className="mt-3 text-[clamp(1.6rem,0.85rem+3.8vw,1.75rem)] font-medium leading-[1.1] tracking-[-0.035em] sm:text-5xl sm:leading-[1.06] sm:tracking-[-0.03em] lg:text-[4.2rem]">
            <span className="block bg-[linear-gradient(135deg,var(--color-text-primary)_0%,var(--color-text-primary)_55%,var(--color-text-muted)_100%)] bg-clip-text text-transparent">
              Short Links.
            </span>
            <span className="relative mt-1 inline-block text-[var(--color-primary)] sm:mt-0">
              Big Possibilities.
              <svg
                aria-hidden="true"
                viewBox="0 0 320 12"
                fill="none"
                className="absolute -bottom-3 left-1/2 h-3 w-[92%] -translate-x-1/2 text-[var(--color-primary)] sm:-bottom-3.5"
              >
                <path
                  d="M2 8 C 80 2, 240 2, 318 8"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  className="home-draw"
                />
              </svg>
            </span>
          </h1>

          {/* Copy */}
          <p className="max-w-xl text-[13px] leading-[1.5] text-[var(--color-text-muted)] sm:text-[15px] sm:leading-relaxed sm:text-balance">
            <span className="sm:hidden">
              Paste a long URL, get a short one instantly, and track every click it earns.
            </span>
            <span className="hidden sm:inline">
              Paste a long URL and get a short one instantly — with custom slugs, cumulative
              click analytics and a dashboard for every link you share.
            </span>
          </p>

          {/* CTAs */}
          <div className="flex flex-row flex-wrap items-center justify-center gap-3">
            <a
              href={ctaHref}
              className="group inline-flex items-center gap-2 rounded-md bg-[image:var(--gradient-primary)] px-5 py-2.5 text-sm font-medium text-[var(--btn-text)] transition hover:brightness-105 focus-brand"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
            <a
              href="#features"
              className="group inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--frame-fill)] px-5 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] backdrop-blur-sm transition-colors hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)] focus-brand"
            >
              See how it works
            </a>
          </div>

          {/* Product visual: the reference mockup frame wrapped around the real shortener */}
          <div className="relative mt-2 w-full max-w-6xl">
            <div className="relative rounded-[20px] border border-[var(--color-border)] bg-[var(--frame-fill)] p-2 backdrop-blur-md">
              {/* Corner ticks */}
              {
                [
                  '-top-1.5 -left-1.5',
                  '-top-1.5 -right-1.5 rotate-90',
                  '-bottom-1.5 -left-1.5 -rotate-90',
                  '-right-1.5 -bottom-1.5 rotate-180',
                ].map((position) => (
                  <span
                    key={position}
                    aria-hidden="true"
                    className={`pointer-events-none absolute ${position} size-3 border-t border-l border-[var(--color-primary)] opacity-70`}
                  />
                ))
              }

              <div className="relative overflow-hidden rounded-[14px] border border-[var(--frame-border)] bg-[linear-gradient(to_bottom,var(--frame-fill-inner),var(--frame-fill))]">
                {/* Browser chrome */}
                <div className="flex items-center justify-between border-b border-[var(--frame-border)] bg-[var(--frame-fill)] px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    {chromeDot('bg-[var(--color-primary)] opacity-55')}
                    {chromeDot('bg-[var(--color-secondary)] opacity-55')}
                    {chromeDot('bg-[var(--color-text-primary)] opacity-15')}
                  </div>
                  <span className="font-mono text-[10px] tracking-[0.16em] text-[var(--color-text-muted)] uppercase">
                    hyperlink
                  </span>
                  <span className="font-mono text-[10px] text-[var(--color-text-subtle)]">
                    https
                  </span>
                </div>

                {/* Canvas: 42px grid behind a radial mask, with the live shortener on top */}
                <div className="relative flex min-h-[26rem] w-full items-center justify-center px-4 py-10 sm:min-h-[30rem] sm:px-8 sm:py-14">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-100"
                    style={{
                      backgroundImage:
                        'linear-gradient(to right, rgba(255,93,110,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,93,110,0.05) 1px, transparent 1px)',
                      backgroundSize: '42px 42px',
                    }}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      background:
                        'radial-gradient(ellipse at center, transparent 30%, var(--color-background) 95%)',
                    }}
                  />

                  <div className={`home-reveal frame-card relative z-10 w-full max-w-md text-left ${''}`} style={reveal(3)}>
                    <div className="frame-card-inner">
                      <p className="m-0 font-mono text-[10px] tracking-[0.16em] text-[var(--color-primary)] uppercase">
                        // Shorten
                      </p>
                      <h2 className="m-0 mt-2 text-lg font-medium tracking-[-0.02em] text-[var(--color-text-primary)]">
                        Shorten your URL
                      </h2>
                      <p className="m-0 mt-1.5 text-[13px] leading-relaxed text-[var(--color-text-muted)]">
                        Paste a long link and get a short one instantly.
                      </p>

                      <form onSubmit={handleSubmit} noValidate className="mt-4 flex flex-col gap-2.5">
                        <label
                          htmlFor="hero-url"
                          className="font-mono text-[10px] tracking-[0.16em] text-[var(--color-text-subtle)] uppercase"
                        >
                          Long URL
                        </label>
                        <div className="relative">
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[var(--color-text-muted)]"
                          >
                            <Link2 className="h-4 w-4" />
                          </div>
                          <input
                            id="hero-url"
                            name="url"
                            type="url"
                            ref={inputRef}
                            value={url}
                            onChange={(event) => setUrl(event.target.value)}
                            placeholder="https://example.com/your-long-url"
                            autoComplete="off"
                            spellCheck={false}
                            className="input-base h-12 w-full rounded-md pl-10 pr-3 text-[15px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-subtle)]"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          aria-busy={isLoading}
                          className="group inline-flex items-center justify-center gap-2 rounded-md bg-[image:var(--gradient-primary)] px-5 py-2.5 text-sm font-medium text-[var(--btn-text)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 focus-brand"
                        >
                          {isLoading ? 'Shortening…' : 'Shorten'}
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                        </button>
                      </form>

                      {error ? (
                        <p role="alert" className="m-0 mt-3 text-[13px] leading-relaxed text-[var(--color-danger)]">
                          {error}
                        </p>
                      ) : null}

                      {shortUrl ? (
                        <div className="mt-3 rounded-md border border-[var(--color-border)] bg-[var(--color-success-soft)] p-3">
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 shrink-0 text-[var(--color-success)]" aria-hidden="true" />
                            <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--color-success)] uppercase">
                              {copied ? 'Copied to clipboard' : 'Link shortened'}
                            </span>
                          </div>

                          <div className="mt-2.5 flex items-center gap-2">
                            <a
                              href={shortUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="min-w-0 flex-1 truncate font-mono text-[11px] text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-primary)] focus-brand"
                            >
                              {shortUrl}
                            </a>
                            <a
                              href={shortUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Open short link in a new tab"
                              title="Open short link"
                              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)] focus-brand"
                            >
                              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                            </a>
                            <button
                              type="button"
                              onClick={handleCopy}
                              aria-label={copied ? 'Copied!' : 'Copy short URL'}
                              title={copied ? 'Copied!' : 'Copy short URL'}
                              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)] focus-brand"
                            >
                              {copied ? (
                                <Check className="h-3.5 w-3.5 text-[var(--color-success)]" aria-hidden="true" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                              )}
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tilted sample cards — the UI Layouts overlapping-card personality */}
              <div
                className="home-reveal absolute -left-6 top-1/3 z-10 hidden w-[13rem] -rotate-6 rounded-md border border-dashed border-[var(--color-border)] bg-[var(--frame-fill-inner)] p-3.5 backdrop-blur-2xl xl:block"
                style={reveal(4)}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="m-0 font-mono text-[10px] tracking-[0.16em] text-[var(--color-text-subtle)] uppercase">
                    // Clicks
                  </p>
                  <span className="rounded border border-[var(--color-border)] px-1.5 py-0.5 font-mono text-[9px] tracking-[0.12em] text-[var(--color-text-muted)] uppercase">
                    Sample
                  </span>
                </div>
                <p className="m-0 mt-2.5 text-xl font-medium tracking-tight text-[var(--color-text-primary)]">
                  1,284
                </p>
                <p className="m-0 text-[10px] text-[var(--color-text-subtle)]">
                  Illustrative value, not account data.
                </p>
              </div>

              <div
                className="home-reveal absolute -right-6 bottom-1/4 z-10 hidden w-[13rem] rotate-6 rounded-md border border-dashed border-[var(--color-border)] bg-[var(--frame-fill-inner)] p-3.5 backdrop-blur-2xl xl:block"
                style={reveal(5)}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="m-0 font-mono text-[10px] tracking-[0.16em] text-[var(--color-text-subtle)] uppercase">
                    // Link
                  </p>
                  <span className="rounded border border-[var(--color-border)] px-1.5 py-0.5 font-mono text-[9px] tracking-[0.12em] text-[var(--color-text-muted)] uppercase">
                    Example
                  </span>
                </div>
                <p className="m-0 mt-2.5 truncate font-mono text-[11px] text-[var(--color-primary)]">
                  hyperlink.pranjalnishad.in/launch
                </p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <ul className="m-0 flex max-w-3xl list-none flex-wrap items-center justify-center gap-x-5 gap-y-2 p-0">
            {benefits.map((label) => (
              <li
                key={label}
                className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-[var(--color-text-muted)] uppercase"
              >
                <span className="block size-1.5 shrink-0 bg-[var(--color-primary)]" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default HeroSocialApp
