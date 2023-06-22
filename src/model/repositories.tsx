interface Repository {
  name: string;
  id: number;
  capacityGB: number;
  freeGB: number;
  usedSpaceGB: number;
}

const fetchData = async (): Promise<Repository[]> => {
  try {
    const response = await fetch("http://localhost:3001/data");
    const jsonData = await response.json();
    const repositories: Repository[] = jsonData.map((data: any) => ({
      name: data.name,
      id: data.id,
      capacityGB: data.capacityGB,
      freeGB: data.freeGB,
      usedSpaceGB: data.usedSpaceGB,
    }));
    return repositories;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

export default fetchData;
