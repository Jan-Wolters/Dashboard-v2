const [Bedrijf, setBedrijf] = useState(initialBedrijf);
const [allSuccess, setAllSuccess] = useState(false);
const [warningMessages, setWarningMessages] = useState([]);
const [dangerItems, setDangerItems] = useState([]);

useEffect(() => {
  const sortBedrijf = (bedrijfArray) => {
    return bedrijfArray.sort((a, b) => {
      const aFailCount = (a.statusB ? 0 : 1) + (a.statusN ? 0 : 1);
      const bFailCount = (b.statusB ? 0 : 1) + (b.statusN ? 0 : 1);

      if (aFailCount === bFailCount) {
        return 0; // Leave items with equal fail count in their original order
      } else if (aFailCount === 2 || bFailCount === 0) {
        return -1; // Put items with both statusB and statusN as false at the top
      } else if (aFailCount === 0 || bFailCount === 2) {
        return 1; // Put items with both statusB and statusN as true at the bottom
      } else {
        return aFailCount - bFailCount; // Sort the rest based on fail count
      }
    });
  };

  const checkAllSuccess = (bedrijfArray) => {
    const sortedBedrijf = sortBedrijf(bedrijfArray);

    const warningItems = sortedBedrijf.filter(
      (item) =>
        (!item.statusB && item.statusN) || (item.statusB && !item.statusN)
    );

    const dangerItems = sortedBedrijf.filter(
      (item) => !item.statusB && !item.statusN
    );

    if (warningItems.length > 0) {
      const messages = warningItems.map((item) => {
        if (!item.statusB && item.statusN) {
          return `${item.name} heeft een Netwerk probleem.`;
        } else if (item.statusB && !item.statusN) {
          return `${item.name} heeft een Backup probleem.`;
        }
      });

      setWarningMessages(messages.filter(Boolean)); // Filter out undefined messages
    } else {
      setWarningMessages([]);
    }

    setDangerItems(dangerItems);

    return sortedBedrijf.every((item) => item.statusB && item.statusN); // Check if both statusB and statusN are true for all items
  };

  setBedrijf((prevBedrijf) => {
    const sortedBedrijf = sortBedrijf(prevBedrijf);
    setAllSuccess(checkAllSuccess(sortedBedrijf));
    return sortedBedrijf;
  });
}, []);
