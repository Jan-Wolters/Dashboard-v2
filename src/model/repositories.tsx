export interface Company {
  company_id: number;
  company_name: string;
  repository_id: number;
  repository_name: string;
  repository_description: string;
  repository_hostId: number;
  repository_hostName: string;
  repository_path: string;
  repository_capacityGB: number;
  repository_freeGB: number;
  repository_usedSpaceGB: number;
}
const fetchEndpoint = async (endpoint: string) => {
  try {
    const response = await fetch(endpoint);
    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

const fetchAndMapData = async <T,>(endpoint: string): Promise<T[]> => {
  const data = await fetchEndpoint(endpoint);
  return data.map((item: any) => item);
};

export const fetchData = async (): Promise<[Company[]]> => {
  try {
    const companydata = await fetchAndMapData<Company>(
      "http://localhost:3003/info"
    );

    return [companydata];
  } catch (error) {
    console.error("Error fetching data:", error);
    return [[]];
  }
};

export const saveCompany = async (companyData: any): Promise<Response> => {
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
      return response;
    } else {
      const errorData = await response.json();
      const error = new Error(errorData.error || "Failed to save company");
      throw error;
    }
  } catch (error) {
    console.error("Error saving company:", error);
    throw error;
  }
};
