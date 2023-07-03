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
export interface Repositorypro {
  name: string;
  id: number;
  capacityGB: number;
  freeGB: number;
  usedSpaceGB: number;
}

export interface Sessionspro {
  id: number;
  name: string;
  endTime: Date;
  resultResult: string;
  resultMessage: string;
}
export const fetchData = async (): Promise<
  [Repository[], Sessions[], Repositorypro[], Sessionspro[]]
> => {
  try {
    const fetchEndpoint = async (endpoint: string) => {
      const response = await fetch(endpoint);
      const jsonData = await response.json();
      return jsonData;
    };

    const repositoriesData = await fetchEndpoint(
      "http://localhost:3002/repositories"
    );
    const sessionsData = await fetchEndpoint("http://localhost:3002/sessions");
    const repositoriesproData = await fetchEndpoint(
      "http://localhost:3002/repositoriespro"
    );
    const sessionsproData = await fetchEndpoint(
      "http://localhost:3002/sessionspro"
    );

    const repositories: Repository[] = repositoriesData.map((data: any) => ({
      name: data.name,
      id: data.id,
      capacityGB: data.capacityGB,
      freeGB: data.freeGB,
      usedSpaceGB: data.usedSpaceGB,
    }));

    const sessions: Sessions[] = sessionsData.map((data: any) => ({
      id: data.id,
      name: data.name,
      endTime: data.endTime,
      resultResult: data.resultResult,
      resultMessage: data.resultMessage,
    }));

    const repositoriespro: Repositorypro[] = repositoriesproData.map(
      (data: any) => ({
        name: data.name,
        id: data.id,
        capacityGB: data.capacityGB,
        freeGB: data.freeGB,
        usedSpaceGB: data.usedSpaceGB,
      })
    );

    const sessionspro: Sessionspro[] = sessionsproData.map((data: any) => ({
      id: data.id,
      name: data.name,
      endTime: data.endTime,
      resultResult: data.resultResult,
      resultMessage: data.resultMessage,
    }));

    return [repositories, sessions, repositoriespro, sessionspro];
  } catch (error) {
    console.error("Error fetching data:", error);
    return [[], [], [], []];
  }
};

export default fetchData;
