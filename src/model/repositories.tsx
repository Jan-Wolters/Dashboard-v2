export interface Repository {
  name: string;
  id: number;
  capacityGB: number;
  freeGB: number;
  usedSpaceGB: number;
}

export interface Sessions {
  id: number;
  name: string;
  endTime: Date;
  resultResult: string;
  resultMessage: string;
}

export interface Backup {
  id: number;
  platformName: string;
  name: string;
  creationTime: Date;
}

export const fetchData = async (): Promise<
  [Repository[], Sessions[], Backup[]]
> => {
  try {
    const response1 = await fetch("http://localhost:3001/data");
    const jsonData1 = await response1.json();
    const repositories: Repository[] = jsonData1.map((data: any) => ({
      name: data.name,
      id: data.id,
      capacityGB: data.capacityGB,
      freeGB: data.freeGB,
      usedSpaceGB: data.usedSpaceGB,
    }));

    const response2 = await fetch("http://localhost:3001/sessions");
    const jsonData2 = await response2.json();
    const sessions: Sessions[] = jsonData2.map((data: any) => ({
      id: data.id,
      name: data.name,
      endTime: data.endTime, // Assuming the endpoint provides the endTime as a string
      resultResult: data.resultResult,
      resultMessage: data.resultMessage,
    }));

    const response3 = await fetch("http://localhost:3001/backup");
    const jsonData3 = await response3.json();
    const backup: Backup[] = jsonData3.map((data: any) => ({
      id: data.id,
      platformName: data.platformName,
      name: data.name,
      creationTime: data.creationTime,
    }));

    return [repositories, sessions, backup];
  } catch (error) {
    console.error("Error fetching data:", error);
    return [[], [], []];
  }
};

export default fetchData;
