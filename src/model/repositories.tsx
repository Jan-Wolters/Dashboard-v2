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

export interface Repositorybear {
  name: string;
  id: number;
  capacityGB: number;
  freeGB: number;
  usedSpaceGB: number;
}

export interface Sessionsbear {
  id: number;
  name: string;
  endTime: Date;
  resultResult: string;
  resultMessage: string;
}

const fetchEndpoint = async (endpoint: string) => {
  const response = await fetch(endpoint);
  const jsonData = await response.json();
  return jsonData;
};

const fetchAndMapData = async <T,>(endpoint: string): Promise<T[]> => {
  const data = await fetchEndpoint(endpoint);
  return data.map((item: any) => item);
};

export const fetchData = async (): Promise<
  [
    Repository[],
    Sessions[],
    Repositorypro[],
    Sessionspro[],
    Repositorybear[],
    Sessionsbear[]
  ]
> => {
  try {
    const repositoriesData = await fetchAndMapData<Repository>(
      "http://localhost:3003/repositories"
    );
    const sessionsData = await fetchAndMapData<Sessions>(
      "http://localhost:3003/sessions"
    );
    const repositoriesproData = await fetchAndMapData<Repositorypro>(
      "http://localhost:3003/repositoriespro"
    );
    const sessionsproData = await fetchAndMapData<Sessionspro>(
      "http://localhost:3003/sessionspro"
    );
    const repositoriesbearData = await fetchAndMapData<Repositorybear>(
      "http://localhost:3003/repositoriesbear"
    );
    const sessionsbearData = await fetchAndMapData<Sessionsbear>(
      "http://localhost:3003/sessionsbear"
    );

    return [
      repositoriesData,
      sessionsData,
      repositoriesproData,
      sessionsproData,
      repositoriesbearData,
      sessionsbearData,
    ];
  } catch (error) {
    console.error("Error fetching data:", error);
    return [[], [], [], [], [], []];
  }
};

export const saveCompany = async (companyData: any) => {
  try {
    const response = await fetch("http://localhost:3003/company", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(companyData),
    });

    if (response.ok) {
      console.log("Company saved successfully");
    } else {
      console.error("Failed to save company");
    }
  } catch (error) {
    console.error("Error saving company:", error);
  }
};
