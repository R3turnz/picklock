var form = document.forms[0];
var keyInput = form.elements["key"];
var isPasswordVisible = false;

document.getElementById("toggle").addEventListener("click", function(event) {
	keyInput.type = (isPasswordVisible) ? "password" : "text";
	event.target.textContent = (isPasswordVisible) ? "Show" : "Hide";
	isPasswordVisible = !isPasswordVisible;
});

form.addEventListener("submit", function(event) {
	event.preventDefault();
	let service = form.elements["service"].value;
	let key = keyInput.value;
	form.reset();
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
			navigator.clipboard.writeText(password);
		});
	});
});
