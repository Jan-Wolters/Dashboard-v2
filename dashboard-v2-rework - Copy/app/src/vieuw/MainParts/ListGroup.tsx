import { useEffect, useState } from "react";
import { fetchData, Company } from "../../model/repositories.ts";
import StatusIcon from "../components/StatusIcon.tsx";

function Repo({ name }: { name: string }) {
	return <div>{name}</div>;
}

function Sess({ name }: { name: string }) {
	return <div>{name}</div>;
}

function Snmp({ disk_description }: { disk_description: string }) {
	return <div>{disk_description}</div>;
}

function CompanyComponent({
	name,
	repositories,
	sessions,
	snmp,
	snmpf,
}: Company) {
	const [collapsed, setCollapsed] = useState(true);

	if (!sessions || !repositories || !snmp || !snmpf) {
		return <div>Company data not available.</div>;
	}

	const sortedSessions = sessions
		.slice()
		.sort(
			(a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
		);

	return (
		<li
			onClick={() => setCollapsed(!collapsed)}
			className={`border border-dark text-center py-3 mt-2 position-relative d-flex align-items-center shadow-sm ${collapsed ? "collapsed-list-item" : ""
				}`}
		>
			<div className="d-flex flex-column w-100">
				<div className="d-flex justify-content-between align-items-center">
					<h3 className="w-100 w-md-25 py-2 px-3 mx-1 font-size">{name}</h3>
					<div className="flex-fill py-2 px-3 mx-1">
						{sessions.length > 0 && sessions[0].resultResult ? (
							<StatusIcon resultMessage={sessions[0].resultResult} />
						) : (
							<div>No result available</div>
						)}
					</div>
					<div className="py-2 mx-1">
						{sortedSessions[0] && sortedSessions[0].endTime
							? new Date(sortedSessions[0].endTime).toLocaleString().split(",").map((value, i) => <div key={i}>{value}</div>)
							: "N/A"}
					</div>
				</div>

				{!collapsed && (
					<>
						<div className="my-3">
							<h5>Repositories:</h5>
							<ul className="list-group d-flex flex-wrap">
								{repositories.map((repo, i) => (
									<li key={i} className="list-group-item d-flex flex-column">
										<Repo name={repo.name} />
										<div className="progress mt-2 ">
											{repo.capacityGB > 0 ? (
												<div
													className={`progress-bar  ${repo.usedSpaceGB / repo.capacityGB >= 0.95
														? "bg-danger "
														: repo.usedSpaceGB / repo.capacityGB >= 0.75
															? "bg-warning border "
															: "bg-success border "
														}`}
													role="progressbar"
													aria-valuenow={repo.usedSpaceGB}
													aria-valuemin={0}
													aria-valuemax={repo.capacityGB}
													style={{
														width: `${(repo.usedSpaceGB / repo.capacityGB) * 100
															}%`
													}}
												>
													{((repo.usedSpaceGB / repo.capacityGB) * 100).toFixed(
														2
													)}
													%
												</div>
											) : (
												<div
													className="progress-bar bg-secondary border border-dark"
													role="progressbar"
												>
													N/A
												</div>
											)}
										</div>
									</li>
								))}
							</ul>
						</div>
						<div className="my-3">
							<h5>Sessions:</h5>
							<ul className="list-group d-flex flex-wrap">
								{sortedSessions.map((session, i) => (
									<li key={i} className="list-group-item">
										<div className="row">
											<div className="col-md-4">
												<Sess name={session.name} />
												<div className="d-flex flex-column">
													<div className="py-2">
														{session.resultResult ? (
															<StatusIcon
																resultMessage={session.resultResult}
															/>
														) : (
															<div>No result available</div>
														)}
													</div>
												</div>
											</div>
											<div className="col-md-4">
												<div
													className="py-2 mx-4"
													style={{ maxWidth: "300px" }}
												>
													{session.resultMessage}
												</div>
											</div>
											<div className="col-md-4">
												<div className="py-2 mx-1">
													{session.endTime
														? new Date(session.endTime).toLocaleString()
														: "N/A"}
												</div>
											</div>
										</div>
									</li>
								))}
							</ul>
						</div>
						{snmp && snmp.length > 0 && snmpf && snmpf.length > 0 && (
							<div className="my-3">
								<h2 className="mb-3">Snmp:</h2>

								<ul className="list-group d-flex flex-wrap">
									{snmp.map((data, i) => (
										<li key={i} className="list-group-item d-flex flex-column">
											<Snmp
												disk_description={data.disk_description || "Unknown"}
											/>
											{/* Assuming Repo component is used to display disk_description */}
											<div className="progress mt-2 border border-dark">
												<div
													className={`progress-bar ${data.disk_used >= data.disk_size
														? "bg-danger"
														: data.disk_used / data.disk_size >= 0.95
															? "bg-danger"
															: data.disk_used / data.disk_size >= 0.75
																? "bg-warning"
																: "bg-success"
														}`}
													role="progressbar"
													aria-valuenow={data.disk_used}
													aria-valuemin={0}
													aria-valuemax={data.disk_size}
													style={{
														width: `${(data.disk_used / data.disk_size) * 100
															}%`,
													}}
												>
													{((data.disk_used / data.disk_size) * 100).toFixed(2)}
													%
												</div>
											</div>
										</li>
									))}
								</ul>

								<ul className="list-group d-flex flex-wrap">
									{snmpf.map((data, i) => (
										<li key={i} className="list-group-item">
											<div className="row">
												<div className="col-md-6">
													<div className="card">
														<div className="card-body">
															<h5 className="card-title">
																<strong>Name:</strong> {data.name}
															</h5>
															<p className="card-text">
																<strong>System Time:</strong> {data.systemtime}
															</p>
															<p className="card-text">
																<strong>Product:</strong> {data.product}
															</p>
														</div>
													</div>
												</div>
											</div>
										</li>
									))}
								</ul>
							</div>
						)}
					</>
				)}
			</div>
		</li>
	);
}

function CompanyGroup() {
	const [companies, setCompanies] = useState([] as Company[]);
	const [errorMessages, setErrorMessages] = useState<string[]>([]);

	useEffect(() => {
		const fetchCompanies = async () => {
			const { data, error } = await fetchData();

			if (error) {
				setErrorMessages([error.message]);
			}
			else {
				setCompanies(data);
			}
		};
		fetchCompanies();
	}, []);

	const priorityOrder: { [key: string]: number } = {
		Success: 2,
		Warning: 1,
		Failed: 0,
	};

	const filteredCompanies = companies
		.slice()
		.sort(
			(a, b) =>
				priorityOrder[a.sessions[0]?.resultResult || ""] -
				priorityOrder[b.sessions[0]?.resultResult || ""]
		);

	return (
		<div id="top" className="shadow-lg p-3 bg-white rounded">
			<div id="List" className="d-fill">
				{errorMessages.length > 0 && (
					<div className="">
						<h1>foutmeldingen:</h1>
						{errorMessages.map((errorMessage, index) => (
							<h6
								key={index}
								className={`rounded py-2 px-1 ${errorMessage.includes("Failed")
									? "alert alert-danger border border-danger"
									: errorMessage.includes("Warning")
										? "alert alert-warning border border-warning"
										: ""
									}`}
							>
								{errorMessage}
							</h6>
						))}
					</div>
				)}
				{filteredCompanies.length === 0 ? (
					<p className="text-center">Niks gevonden</p>
				) : (
					<div>
						<div className="row row-cols-1 row-cols-md-2">
							{filteredCompanies.map((company, i) => (
								<div key={i} className="col mb-4">
									<CompanyComponent {...company} />
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default CompanyGroup;
