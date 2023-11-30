document.addEventListener("DOMContentLoaded", () => {
	let allMedia = [];
	const maxChars = 280;
	const tweetButton = document.getElementById("tweetButton");
	const tweetText = document.getElementById("tweet-text");
	const mediaInput = document.getElementById("mediaInput");
	const mediaButton = document.getElementById("mediaButton");
	const progressBar = document.querySelector(".progress-bar");
	const progressBarValue = document.querySelector(".progress-bar-value");
	const progressBarText = document.querySelector(".progress-bar-text");

	tweetButton.disabled = true;

	tweetText.addEventListener("input", () => {
		const tweetLength = tweetText.value.length;
		const progress = tweetLength / maxChars;
		const remainingChars = maxChars - tweetLength;

		const maxOffset = parseFloat(
			progressBarValue.getAttribute("stroke-dasharray")
		);

		progressBarValue.style.strokeDashoffset = maxOffset * (1 - progress);

		if (remainingChars <= 20 && remainingChars > 0) {
			progressBarValue.style.visibility = "visible";
			progressBar.style.visibility = "visible";
			progressBarValue.style.stroke = "#f1c40f";
			progressBarText.textContent = remainingChars.toString();
			progressBarText.setAttribute("display", "block");
		} else if (remainingChars <= 0 && remainingChars > -10) {
			progressBarValue.style.strokeDashoffset = 0;
			progressBarValue.style.visibility = "visible";
			progressBar.style.visibility = "visible";
			progressBarValue.style.stroke = "red";
			progressBarText.textContent = remainingChars.toString();
			progressBarText.style.visibility = "visible";
		} else if (remainingChars <= -10) {
			progressBarValue.style.visibility = "hidden";
			progressBar.style.visibility = "hidden";
			progressBarText.textContent = remainingChars.toString();
			progressBarText.style.visibility = "visible";
		} else {
			progressBarValue.style.visibility = "visible";
			progressBar.style.visibility = "visible";
			progressBarValue.style.stroke = "#1da1f2";
			progressBarText.setAttribute("display", "none");
		}

		if (tweetLength === 0) {
			// If there is no text, ensure the progress bar is completely reset
			progressBarValue.style.strokeDashoffset = maxOffset;
		}
		// TODO: Conditional rendering of the circles

		tweetButton.disabled = tweetLength === 0 || tweetLength > maxChars;
	});

	// TODO: Conditional rendering of the circles
	// TODO: Not scrollbar, expand div
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
