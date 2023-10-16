import Company from "../vieuw/RoutePath/CompanyADD";

export interface Repository {
  id: number,
  name: string,
  description: string,
  hostId: number,
  hostName: string,
  path: string,
  capacityGB: number,
  freeGB: number,
  usedSpaceGB: number
}

export interface Session {
  sessions_id: string,
  company_id: number,
  name: string,
  activityId: string,
  sessionType: string,
  creationTime: string,
  endTime: string,
  state: string,
  progressPercent: number,
  resultResult: string,
  resultMessage: string,
  resultIsCanceled: number,
  resourceId: string,
  resourceReference: string,
  parentSessionId: string,
  usn: number
}

export interface Company {
  company_id: number;
  name: string;
  repositories: Repository[];
  sessions: Session[];
}
export interface CompanyList {
  company_id: number;
  company_name: string;
  company_ip: string;
  company_port: string;
  veaamUsername: string;
  veaamPassword: string;
}

const ip = "168.27.51";
const port = "8080"

const fetchEndpoint = async (endpoint: string) => {
  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const fetchData = async (): Promise<Company[]> => {
  try {
    const endpoint = `http://${ip}:${port}/info`;
    const companyData = await fetchEndpoint(endpoint);
    return companyData;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

export const fetchDatacon = async (): Promise<CompanyList[] | null> => {
  try {
    const endpoint = `http://${ip}:${port}/infocon`;
    console.log("Fetching data from:", endpoint);

    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error("Failed to fetch data from repositories.ts");
    }

    const companyData = await response.json();

    if (Array.isArray(companyData)) {
      console.log("Received data:", companyData);
      return companyData;
    } else {
      console.error("Received data is not an array:", companyData);
      throw new Error("Data received is not an array");
    }
  } catch (error) {
    console.error("Error fetching data from repositories.ts:", error);
    return null;
  }
};

export const saveCompany = async (
  companyData: Partial<Company>
): Promise<void> => {
  try {
    const response = await fetch(`http://${ip}:${port}/companies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(companyData),
    });

    if (!response.ok) {
      throw new Error("Failed to save company");
    }

    console.log("Company saved successfully");

    // Refresh the page upon successful save
    window.location.reload();
  } catch (error) {
    console.error("Error saving company:", error);
    throw error;
  }
};

export const deleteCompany = async (companyId: number): Promise<void> => {
  try {
    const response = await fetch(`http://${ip}:${port}/companies/${companyId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete company");
    }

    console.log("Company deleted successfully");

    // You can perform any additional actions here after successful deletion
    window.location.reload();
  } catch (error) {
    console.error("Error deleting company:", error);
    throw error;
  }
};
export const login = async (username: string, password: string): Promise<boolean> => {
  try {
    const response = await fetch(`http://${ip}:${port}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Authentication failed");
    }

    console.log("Authentication successful");
    return true;
  } catch (error) {
    console.error("Error during authentication:", error);
    return false;
  }
};