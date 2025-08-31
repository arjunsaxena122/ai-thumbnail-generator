export async function authenticator() {
  try {
    const response = await fetch("/api/upload-auth")
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Request failed with status ${response.status}: ${errorText}`)
    }
    const data = await response.json()
    const { signature, expire, token, publicKey } = data || {}
    return { signature, expire, token, publicKey }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Authentication error:", error)
    throw new Error("Authentication request failed")
  }
}
