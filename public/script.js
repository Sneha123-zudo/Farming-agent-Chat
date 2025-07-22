async function sendMessage() {
  const input = document.getElementById("userInput");
  const chatBox = document.getElementById("chatBox");
  const message = input.value.trim();
  if (!message) return;

  chatBox.innerHTML += `<div class="message user">${message}</div>`;
  input.value = "";

  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });

  const data = await res.json();
  chatBox.innerHTML += `<div class="message bot">${data.response}</div>`;
  chatBox.scrollTop = chatBox.scrollHeight;
}
