export default function useVirtualScroll({ items }) {
  
  const [scrollTop, setScrollTop] = useState(0);
  const [virtualElem, setVirtualElem] = useState(items.slice(0, 10));
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
    const totalRows = Math.ceil(items.length / roundedElements);
    fakeScrollContainer.current.style.height = `${totalRows * childHeight}px`;
  }

  function calculatePosition() {
    const rangeStart = scrollTop;
    const rangeEnd = scrollTop + listHeight;

    let startIndex = Math.floor(rangeStart / itemHeight) * itemsPerRow;
    let endIndex = Math.ceil(rangeEnd / itemHeight) * itemsPerRow;

    startIndex = Math.max(0, startIndex - itemsPerRow * overscan) || 0;

    endIndex =
      Math.min(items.length - 1, endIndex + itemsPerRow * overscan) || 10;

    setVirtualElem(items.slice(startIndex, endIndex));
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
    if (virtualElem.length > 0 && !isFirstSetLoad.current) {
      isFirstSetLoad.current = true;
      setSizeScroll();
    }
  }, [virtualElem]);

  useLayoutEffect(() => {
    if (virtualElem.length !== 0) {
      calculatePosition();
    }
  }, [scrollTop, itemHeight, listHeight]);
}
