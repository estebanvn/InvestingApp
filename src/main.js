async function getWaitlistCount() {
  try {
    const res = await fetch('/api/waitlist')
    if (!res.ok) return 0
    const data = await res.json()
    return data.count ?? 0
  } catch {
    return 0
  }
}

function updateCountDisplay(count) {
  const el = document.getElementById('waitlist-count')
  if (el) el.textContent = count.toLocaleString()
}

function showMessage(msgEl, text, isError = false) {
  msgEl.textContent = text
  msgEl.className = isError ? 'form-message error' : 'form-message success'
  msgEl.style.display = 'block'
}

function hideMessage(msgEl) {
  msgEl.style.display = 'none'
}

async function handleSubmit(e, emailInput, submitBtn, msgEl) {
  e.preventDefault()
  const email = emailInput.value.trim()
  if (!email) return

  hideMessage(msgEl)
  const originalText = submitBtn.textContent
  submitBtn.disabled = true
  submitBtn.textContent = 'Joining...'

  try {
    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()

    if (!res.ok) {
      showMessage(msgEl, data.error || 'Something went wrong.', true)
    } else {
      showMessage(msgEl, "You're on the list! We'll be in touch soon.")
      emailInput.value = ''
      const count = await getWaitlistCount()
      updateCountDisplay(count)
    }
  } catch {
    showMessage(msgEl, 'Something went wrong. Please try again.', true)
  }

  submitBtn.disabled = false
  submitBtn.textContent = originalText
}

document.addEventListener('DOMContentLoaded', async () => {
  const count = await getWaitlistCount()
  updateCountDisplay(count)

  const form1 = document.getElementById('waitlist-form')
  const email1 = document.getElementById('email-input')
  const btn1 = document.getElementById('submit-btn')
  const msg1 = document.getElementById('form-message')

  if (form1) {
    form1.addEventListener('submit', (e) => handleSubmit(e, email1, btn1, msg1))
  }

  const form2 = document.getElementById('waitlist-form-bottom')
  const email2 = document.getElementById('email-input-bottom')
  const btn2 = document.getElementById('submit-btn-bottom')
  const msg2 = document.getElementById('form-message-bottom')

  if (form2) {
    form2.addEventListener('submit', (e) => handleSubmit(e, email2, btn2, msg2))
  }
})
