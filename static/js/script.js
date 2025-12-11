document.addEventListener("DOMContentLoaded", () => {
  let allMedia = [];
  const maxChars = 280;
  const tweetButton = document.getElementById("tweet-button");
  const tweetText = document.getElementById("tweet-text");
  const mediaInput = document.getElementById("media-input");
  const mediaButton = document.getElementById("media-button");
  const mediaButtons = document.querySelectorAll(".img-icons-btn");
  const modeToggle = document.getElementById("mode-toggle");
  const progressBar = document.querySelector(".progress-bar");
  const progressBarValue = document.querySelector(".progress-bar-value");
  const progressBarText = document.querySelector(".progress-bar-text");
  const verticalLine = document.querySelector(".vertical-line");
  const addIconBtn = document.querySelector(".add-icon-btn");
  const body = document.body;
  const tweetContainer = document.querySelector(".tweet-container");

  modeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    tweetContainer.classList.toggle("dark-mode");
    tweetText.classList.toggle("dark-mode");
  });

  progressBar.style.display = "none";
  verticalLine.style.display = "none";
  addIconBtn.style.display = "none";

  tweetButton.disabled = true;

  function adjustTextAreaHeight() {
    tweetText.style.height = "auto";
    tweetText.style.height = tweetText.scrollHeight + "px";
  }

  function toggleElementsVisibility(visible) {
    const displayStyle = visible ? "block" : "none";
    progressBar.style.display = displayStyle;
    verticalLine.style.display = displayStyle;
    addIconBtn.style.display = displayStyle;
  }
  adjustTextAreaHeight();

  tweetText.addEventListener("input", () => {
    adjustTextAreaHeight();
    const tweetLength = tweetText.value.length;
    const progress = tweetLength / maxChars;
    const remainingChars = maxChars - tweetLength;

    toggleElementsVisibility(tweetLength > 0);
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
      progressBarText.style.stroke = "red";
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

    tweetButton.disabled = tweetLength === 0 || tweetLength > maxChars;
  });

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
      mediaButtons.disabled = allMedia.length >= 4;
      console.log(mediaButtons.disabled);
    }
  });

  function updateMediaList() {
    const container = document.getElementById("image-preview-container");
    container.innerHTML = "";
    container.className = "image-preview-container";

    allMedia.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.alt = "Preview";

        const preview = document.createElement("div");
        preview.className = "image-preview";
        preview.appendChild(img);

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.type = "button";

        const deleteImage = document.createElement("img");
        deleteImage.src =
          "static/images/twitter-newui-iconkit/svg/twitter-cross-2.svg";
        deleteImage.alt = "Delete";
        deleteImage.className = "delete-icon";

        // Append the image to the button
        deleteButton.appendChild(deleteImage);

        // Add the click event listener to the button
        deleteButton.addEventListener("click", () => {
          URL.revokeObjectURL(img.src);
          allMedia.splice(index, 1);
          updateMediaList();
          // Update the disabled state of the mediaButtons
          mediaButtons.forEach(
            (button) => (button.disabled = allMedia.length >= 4)
          );
        });

        preview.appendChild(deleteButton);
        container.appendChild(preview);
      };
      reader.readAsDataURL(file);
    });

    const imageCountClass = `image-preview-container-${allMedia.length}-images`;
    container.classList.add(imageCountClass);

    const disableButtons = allMedia.length >= 4;
    mediaButtons.forEach((button) => {
      button.disabled = disableButtons;
    });

    mediaButtons.forEach((button) => {
      if (disableButtons) {
        button.classList.add("disabled");
        button.style.cursor = "default";
        button.style.pointerEvents = "none";
      } else {
        button.classList.remove("disabled");
        button.style.cursor = "pointer";
        button.style.pointerEvents = "auto";
      }
    });
  }

  tweetButton.addEventListener("click", () => {
    const formData = new FormData();
    formData.append("text", tweetText.value);

    // Pass secret token from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("key");
    if (token) {
      formData.append("token", token);
    }

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
          if (data.demo) {
            alert("🎭 Demo Mode\n\nThis demo doesn't connect to the live API!");
          } else {
            alert("Tweet posted successfully!");
          }
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

  mediaButton.addEventListener("click", () => {
    mediaInput.click();
  });
});
