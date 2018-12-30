var form = document.forms[0];
var keyInput = form.elements["key"];
var unmaskButton = document.getElementById("unmask");

function maskPassword() {
	keyInput.removeEventListener("focus", maskPassword);
	keyInput.type = "password";
	unmaskButton.disabled = false;
}

unmaskButton.addEventListener("click", function(event) {
	event.preventDefault();
	unmaskButton.disabled = true;
	keyInput.type = "text";
	keyInput.addEventListener("focus", maskPassword);
});

var generateButton = document.getElementById("generate");
form.addEventListener("submit", function(event) {
	event.preventDefault();
	generateButton.disabled = true;
	maskPassword();
	let service = form.elements["service"].value;
	let key = keyInput.value;
	let bytes = new TextEncoder().encode(service + key);
	let salt = Uint8Array.from(atob("qS4rkSr5KGt"), c => c.charCodeAt(0));
	window.crypto.subtle.importKey("raw", bytes, {
		name: "PBKDF2"
	}, false, ["deriveBits"]).then(function(key) {
		window.crypto.subtle.deriveBits({
			name: "PBKDF2",
			hash: "SHA-512",
			salt: salt,
			iterations: 100000
		}, key, 144).then(function(hash) {
			let password = btoa(String.fromCharCode(...new Uint8Array(hash)));
			displayResult(password);
			form.addEventListener("input", enableGenerateButton);
		});
	});
});

var passwordSpan, copyButton;
function displayResult(password) {
	if (passwordSpan !== undefined && copyButton !== undefined) {
		passwordSpan.textContent = password;
		copyButton.textContent = "Copy";
		copyButton.disabled = false;
		return;
	}

	let resultDiv = document.createElement("div");
	resultDiv.setAttribute("id", "result");

	passwordSpan = document.createElement("span");
	passwordSpan.setAttribute("id", "password");
	passwordSpan.textContent = password;
	resultDiv.appendChild(passwordSpan);

	copyButton = document.createElement("button");
	copyButton.setAttribute("id", "copy")
	copyButton.textContent = "Copy";
	copyButton.addEventListener("click", copyPassword);
	resultDiv.appendChild(copyButton);

	let containerDiv = document.getElementsByClassName("container")[0];
	containerDiv.appendChild(resultDiv);
}

function copyPassword() {
	copyButton.disabled = true;
	let selection = window.getSelection();
	let range = document.createRange();
	range.selectNodeContents(passwordSpan);
	selection.removeAllRanges();
	selection.addRange(range);
	document.execCommand("copy");
	selection.removeAllRanges();
	copyButton.textContent = "Copied to clipboard!";
}

function enableGenerateButton() {
	form.removeEventListener("input", enableGenerateButton);
	generateButton.disabled = false;
}
