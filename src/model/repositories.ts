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
export interface SNMP {
  company_id : number;
  system_name:string;
  system_uptime:number; 
  disk_size:number;
  disk_used:number
  disk_description: string

}
export interface SNMPF{
  company_id : number;
  name : string;
  product:string;
  uptime:number;
  systemtime:string;
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
  snmp:SNMP[];
  snmpf:SNMPF[];

}

export interface CompanyList {
  company_id: number;
  company_name: string;
  company_ip: string;
  company_port: string;
  veaamUsername: string;
  veaamPassword: string;
}



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
    const endpoint = `/info`;
    const companyData = await fetchEndpoint(endpoint);
    return companyData;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};




export const fetchDatacon = async (): Promise<CompanyList[] | null> => {
  try {
    const endpoint = `localhost/infocon`;
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
    const response = await fetch(`/companies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(companyData),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Failed to save company: ${errorMessage}`);
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
    const response = await fetch(`/companies/${companyId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Failed to delete company: ${errorMessage}`);
    }

    console.log("Company deleted successfully");

    // You can perform any additional actions here after successful deletion
    window.location.reload();
  } catch (error) {
    console.error("Error deleting company:", error);
    throw error;
  }
};


export const login = async (username: string, password: string) => {
  try {
    const response = await fetch("/loginEN", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.token) {
        // Store the token and return true
        return true;
      } else {
        console.error("Authentication failed: No token received");
        return false;
      }
    } else if (response.status === 401) {
      console.error("Authentication failed: Invalid credentials");
      return false;
    } else if (response.status === 500) {
      console.error("Authentication failed: Server error");
      return false;
    } else {
      console.error(`Authentication failed: Status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    throw new Error("An error occurred while logging in.");
  }
};
