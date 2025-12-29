import { useLayoutEffect, useMemo, useRef, useState } from "react";

const createItems = () =>
  Array.from({ length: 101 }, (_, index) => ({
    id: index,
    text: `Item ${index}`,
  }));

const itemsArr = createItems();
const overscan = 1;

export default function ScrollInElement() {
  const [scrollTop, setScrollTop] = useState(0);
  const [items, setItems] = useState([]);
  const [itemHeight, setItemHeight] = useState(0);
  const [listHeight, setListHeight] = useState(0);
  const [itemsPerRow, setItemsPerRow] = useState(0);

  const isFirstSetLoad = useRef(false);

  const delayTimer = useRef(null);

  const scrollContainer = useRef(null);
  const gridContainer = useRef(null);
  const fakeScrollContainer = useRef(null);

  useLayoutEffect(() => {
    const scrollElement = scrollContainer.current;

    if (!scrollElement) {
      return;
    }

    const handleScroll = () => {
      const scrollTop = scrollElement.scrollTop;

      setScrollTop(scrollTop);
    };

    handleScroll();

    scrollElement.addEventListener("scroll", handleScroll);

    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, []);

  function calculateElementsInRow(gridElement) {
    const child = gridElement.firstElementChild;

    const { height: childHeight, width: childWidth } =
      child.getBoundingClientRect();

    const elementsInRow = gridElement.clientWidth / childWidth;

    const roundedElements =
      elementsInRow % 1 >= 0.99
        ? Math.ceil(elementsInRow)
        : Math.floor(elementsInRow);

    return { roundedElements: roundedElements || 1, childHeight };
  }

  function setSizeScroll() {
    const scrollElement = scrollContainer.current;
    const gridElement = gridContainer.current;

    if (!scrollElement || !gridElement) return;

    // Устанавливаем высоту видимой части
    setListHeight(scrollElement.clientHeight);

    const { roundedElements, childHeight } =
      calculateElementsInRow(gridElement);

    setItemHeight(childHeight);
    setItemsPerRow(roundedElements);

    // Устанавливаем высоту фейкового контейнера
    const totalRows = Math.ceil(itemsArr.length / roundedElements);
    fakeScrollContainer.current.style.height = `${totalRows * childHeight}px`;
  }

  function calculatePosition() {
    const rangeStart = scrollTop;
    const rangeEnd = scrollTop + listHeight;

    let startIndex = Math.floor(rangeStart / itemHeight) * itemsPerRow;
    let endIndex = Math.ceil(rangeEnd / itemHeight) * itemsPerRow;

    startIndex = Math.max(0, startIndex - itemsPerRow * overscan) || 0;

    endIndex =
      Math.min(itemsArr.length - 1, endIndex + itemsPerRow * overscan) || 10;

    setItems(itemsArr.slice(startIndex, endIndex));
    // console.log(startIndex, endIndex);
  }

  useLayoutEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (delayTimer.current) {
        clearTimeout(delayTimer.current); // Сбрасываем предыдущий таймер
      }

      delayTimer.current = setTimeout(() => {
        setSizeScroll();
        calculatePosition();
      }, 300); // Устанавливаем задержку в 300 мс
    });

    const container = scrollContainer.current;

    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      if (delayTimer.current) {
        clearTimeout(delayTimer.current);
        delayTimer.current = null;
      }
      resizeObserver.disconnect();
    };
  }, []);

  // useLayoutEffect(() => {
  //   if (items.length > 0 && !isFirstSetLoad.current) {
  //     isFirstSetLoad.current = true;
  //     setSizeScroll();
  //   }
  // }, [items]);

  // useLayoutEffect(() => {
  //   if (items.length === 0) {
  //     const newArr = itemsArr.slice(0, 10);
  //     setItems(newArr);
  //   } else {
  //     calculatePosition();
  //   }
  // }, [scrollTop, itemHeight, listHeight]);

  const isOpenCard = useRef({
    isOpen: false,
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    parent: null,
  });

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

  return (
    <div className="app">
      <header className="header">Header</header>

      <div className="categories">
        <div className="categoriesType">categories</div>

        <div ref={scrollContainer} className="scrollContainer">
          <div className="fackeScrollContainer" ref={fakeScrollContainer}></div>
          <div
            style={{
              transform: `translateY(${
                Math.floor(scrollTop / itemHeight) * itemHeight -
                (scrollTop < itemHeight * overscan ? 0 : itemHeight * overscan)
              }px)`,
            }}
            ref={gridContainer}
            className="gridContainer"
          >
            {items.map(({ id, text }) => {
              return (
                <div key={id} className="gridElem">
                  <div onClick={toggleCard} className="gridItem">
                    {text}
                  </div>
                </div>
              );
            })}
            {/* <div className="loadingBlock">Loading</div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

// {items.map(({ id, text }) => {
//   return (
//     <div key={id} className="gridElem">
//       <div onClick={toggleCard} className="gridItem">
//         {text}
//       </div>
//     </div>
//   );
// })}
