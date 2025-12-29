import { useLayoutEffect, useMemo, useRef, useState } from "react";

const createItems = () =>
  Array.from({ length: 101 }, (_, index) => ({
    id: index,
    text: `Item ${index}`,
  }));

const itemsArr = createItems();
const overscan = 1;

export default function App() {
  const [scrollTop, setScrollTop] = useState(0);
  const [items, setItems] = useState([]);
  const [itemHeight, setItemHeight] = useState(0);
  const [listHeight, setListHeight] = useState(0);
  const [itemsPerRow, setItemsPerRow] = useState(0);

  const [topCompensation, setTopCompensation] = useState(0);

  const isFirstSetLoad = useRef(false);

  const delayTimer = useRef(null);

  const scrollContainer = useRef(null);
  const gridContainer = useRef(null);
  const fakeScrollContainer = useRef(null);

  useLayoutEffect(() => {
    const gridElement = gridContainer.current;

    const { top } = gridElement.getBoundingClientRect();

    setTopCompensation(top);

    console.log(top);
  }, []);

  useLayoutEffect(() => {
    const scrollElement = document.getElementById("root");

    if (!scrollElement) {
      return;
    }

    const handleScroll = () => {
      const scrollTop = scrollElement.scrollTop;

      setScrollTop(
        scrollTop >= topCompensation ? scrollTop - topCompensation : 0
      );
    };

    handleScroll();

    scrollElement.addEventListener("scroll", handleScroll);

    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [topCompensation]);

  function calculateElementsInRow(gridElement) {
    const child = gridElement.firstElementChild;

    const { height: childHeight, width: childWidth } =
      child.getBoundingClientRect();

    const elementsInRow = gridElement.clientWidth / childWidth;

    const roundedElements =
      elementsInRow % 1 >= 0.99
        ? Math.ceil(elementsInRow)
        : Math.floor(elementsInRow);

    console.log(roundedElements);

    return { roundedElements: roundedElements || 1, childHeight };
  }

  function setSizeScroll() {
    const scrollElement = scrollContainer.current;
    const gridElement = gridContainer.current;

    if (!scrollElement || !gridElement) return;

    // Устанавливаем высоту видимой части
    setListHeight(gridElement.clientHeight);

    const { roundedElements, childHeight } =
      calculateElementsInRow(gridElement);

    setItemHeight(childHeight);
    setItemsPerRow(roundedElements);

    // Устанавливаем высоту фейкового контейнера
    const totalRows = Math.ceil((itemsArr.length - 1) / roundedElements);
    fakeScrollContainer.current.style.height = `${totalRows * childHeight}px`;
    console.log(totalRows * childHeight);
  }

  function calculatePosition() {
    const rangeStart = scrollTop;
    const rangeEnd = scrollTop + listHeight;

    // console.log(Math.floor(rangeStart / itemHeight) * itemsPerRow);

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

  useLayoutEffect(() => {
    if (items.length > 0 && !isFirstSetLoad.current) {
      isFirstSetLoad.current = true;
      setSizeScroll();
    }
  }, [items]);

  useLayoutEffect(() => {
    if (items.length === 0) {
      const newArr = itemsArr.slice(0, 10);
      setItems(newArr);
    } else {
      calculatePosition();
    }
  }, [scrollTop, itemHeight, listHeight]);

  return (
    <>
      <header className="header">Header</header>
      <div ref={scrollContainer} className="scrollContainer">
        <div className="fackeScrollContainer" ref={fakeScrollContainer}></div>
        <div
          style={{
            transform: `translateY(
                ${
                  itemHeight * overscan >= scrollTop
                    ? Math.floor(scrollTop / itemHeight) * itemHeight
                    : Math.floor(scrollTop / itemHeight) * itemHeight -
                      itemHeight * overscan
                }px
              )`,
          }}
          ref={gridContainer}
          className="gridContainer"
        >
          {items.map(({ id, text }) => {
            return (
              <div key={id} className="gridElem">
                <div className="gridItem">{text}</div>
              </div>
            );
          })}
          {/* <div className="loadingBlock">Loading</div> */}
        </div>
      </div>
      <footer className="footer">Footer</footer>
    </>
  );
}
