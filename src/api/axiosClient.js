const parseResponse = async (response) => {
  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    const message = data?.message || data?.error || 'Request failed'
    throw new Error(message)
  }

  return data
}

export const request = async (baseURL, path, options = {}) => {
  const token = options.token || localStorage.getItem('kanban_token')
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${baseURL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  return parseResponse(response)
}
