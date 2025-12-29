function toggleCard(e) {
  const card = e.target;

  if (!isOpenCard.current.isOpen) {
    const parent = card.parentNode;

    const { left, top, width, height } = card.getBoundingClientRect();

    isOpenCard.current = { isOpen: true, top, left, width, height, parent };

    card.style.width = `${width}px`;
    card.style.height = `${height}px`;

    card.style.left = `${left}px`;
    card.style.top = `${top}px`;

    document.body.appendChild(card);

    requestAnimationFrame(() => {
      card.style.width = "100%";
      card.style.height = "100%";

      card.style.left = "0px";
      card.style.top = "0px";
    });

    card.addEventListener("click", toggleCard);
  } else {
    const { left, top, width, height } = card.getBoundingClientRect();

    const {
      top: prevTop,
      left: prevLeft,
      width: pevWidth,
      height: prevHeight,
      parent,
    } = isOpenCard.current;

    card.style.width = `${width}px`;
    card.style.height = `${height}px`;

    card.style.left = `${left}px`;
    card.style.top = `${top}px`;

    requestAnimationFrame(() => {
      card.style.width = `${pevWidth}px`;
      card.style.height = `${prevHeight}px`;

      card.style.left = `${prevLeft}px`;
      card.style.top = `${prevTop}px`;

      card.addEventListener("transitionend", function onTransitionEnd() {
        card.style.width = `100%`;
        card.style.height = `100%`;
        card.style.left = `0`;
        card.style.top = `0`;
        parent.appendChild(card);

        // Удаляем обработчик события
        card.removeEventListener("transitionend", onTransitionEnd);
      });
    });

    isOpenCard.current = { isOpen: false };

    card.removeEventListener("click", toggleCard);
  }
}
