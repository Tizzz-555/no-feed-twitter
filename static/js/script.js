document.addEventListener("DOMContentLoaded", () => {
	let allMedia = [];
	const maxChars = 280;
	const tweetButton = document.getElementById("tweetButton");
	const tweetText = document.getElementById("tweet-text");
	const mediaInput = document.getElementById("mediaInput");
	const mediaButton = document.getElementById("mediaButton");
	const tweetTextArea = document.getElementById("tweet-text");
	const progressBar = document.getElementById("progress-bar");
	const progressBarFill = document.getElementById("progress-bar-fill");
	const charCountDisplay = document.getElementById("char-count");

	tweetButton.disabled = true;

	// tweetTextArea.addEventListener("input", () => {
	// 	const tweetLength = tweetTextArea.value.length;
	// 	tweetButton.disabled = tweetLength === 0 || tweetLength > maxChars;

	// 	// Optional: Update progress bar and character count
	// 	// progressBarFill.style.width = `${(tweetLength / maxChars) * 100}%`;
	// 	// charCountDisplay.textContent = `${tweetLength}/280`;
	// });

	mediaInput.addEventListener("change", () => {
		if (allMedia.length + mediaInput.files.length > 4) {
			alert("Please upload up to 4 photos.");
			mediaInput.value = "";
		} else {
			for (let i = 0; i < mediaInput.files.length; i++) {
				const file = mediaInput.files[i];
				allMedia.push(file);
			}
			updateMediaList();
			mediaButton.disabled = allMedia.length >= 4;
		}
	});

	function updateMediaList() {
		const container = document.getElementById("image-preview-container");
		container.innerHTML = "";
		allMedia.forEach((file, index) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				const img = document.createElement("img");
				img.src = e.target.result;
				img.alt = "Preview";

				const preview = document.createElement("div");
				preview.className = "image-preview";
				preview.appendChild(img);

				const deleteIcon = document.createElement("div");
				deleteIcon.className = "delete-icon";
				deleteIcon.innerHTML = "✖";
				deleteIcon.onclick = function () {
					URL.revokeObjectURL(img.src);
					allMedia.splice(index, 1);
					updateMediaList();
					mediaButton.disabled = allMedia.length >= 4;
				};

				preview.appendChild(deleteIcon);
				container.appendChild(preview);
			};
			reader.readAsDataURL(file);
		});
	}
	tweetButton.addEventListener("click", () => {
		const formData = new FormData();
		formData.append("text", tweetText.value);

		if (mediaInput.files.length > 0) {
			allMedia.forEach((file) => {
				formData.append("media", file);
			});
		}

		fetch("/post_tweet", {
			method: "POST",
			body: formData,
		})
			.then((response) => {
				if (!response.ok) {
					// Attempt to read the JSON error message, if possible
					return response
						.json()
						.then((errorData) => {
							throw new Error(errorData.error || "Network response was not ok");
						})
						.catch(() => {
							// If the response is not JSON, throw a general error
							throw new Error(
								"Network response was not ok and no error message is available"
							);
						});
				}
				return response.json();
			})
			.then((data) => {
				if (data.success) {
					alert("Tweet posted successfully!");
				} else {
					console.error("Failed to post tweet:", data.error);
					alert("Failed to post tweet.");
				}
			})
			.catch((error) => {
				console.error("Error:", error);
				alert("An error occurred while posting the tweet." + error.message);
			});
	});

	document.getElementById("mediaButton").addEventListener("click", () => {
		mediaInput.click();
	});

	function resetForm() {
		tweetText.value = "";
		mediaInput.value = "";
		allMedia = [];
		updateMediaList();
	}
});
