const REQUEST_ID_LENGTH = 8

function generateRequestId(): string {
  return Math.random()
    .toString(36)
    .slice(2, 2 + REQUEST_ID_LENGTH)
}

export function createAiLogger(requestId?: string) {
  const id = requestId ?? generateRequestId()

  function formatMessage(label: string, message: string): string {
    return `[AI][${id}] [${label}] ${message}`
  }

  return {
    requestId: id,
    info(label: string, message: string, data?: unknown) {
      const formatted = formatMessage(label, message)
      if (data !== undefined) {
        console.info(
          formatted,
          typeof data === "object" ? JSON.stringify(data) : data
        )
      } else {
        console.info(formatted)
      }
    },
    warn(label: string, message: string, data?: unknown) {
      const formatted = formatMessage(label, message)
      if (data !== undefined) {
        console.warn(
          formatted,
          typeof data === "object" ? JSON.stringify(data) : data
        )
      } else {
        console.warn(formatted)
      }
    },
    error(label: string, message: string, data?: unknown) {
      const formatted = formatMessage(label, message)
      if (data !== undefined) {
        console.error(
          formatted,
          typeof data === "object" ? JSON.stringify(data) : data
        )
      } else {
        console.error(formatted)
      }
    },
    debug(label: string, message: string, data?: unknown) {
      const formatted = formatMessage(label, message)
      if (data !== undefined) {
        console.debug(
          formatted,
          typeof data === "object" ? JSON.stringify(data) : data
        )
      } else {
        console.debug(formatted)
      }
    },
    step(stepName: string, message: string, data?: unknown) {
      const formatted = formatMessage("STEP", `${stepName}: ${message}`)
      if (data !== undefined) {
        console.info(
          formatted,
          typeof data === "object" ? JSON.stringify(data) : data
        )
      } else {
        console.info(formatted)
      }
    },
    timing(label: string, startTime: number, message?: string) {
      const duration = Date.now() - startTime
      const formatted = formatMessage(
        "TIMING",
        `${label} took ${duration}ms${message ? ` — ${message}` : ""}`
      )
      console.info(formatted)
      return duration
    },
  }
}

export type AiLogger = ReturnType<typeof createAiLogger>
