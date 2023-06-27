import React from "react";

interface StatusMessageProps {
  sessions: Sessions[];
}

interface Sessions {
  id: number;
  name: string;
  endTime: Date;
  resultResult: string;
  resultMessage: string;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ sessions }) => {
  const warningSessions = sessions.filter((session) =>
    session.resultResult.includes("Warning")
  );
  const failedSessions = sessions.filter((session) =>
    session.resultResult.includes("Failed")
  );

  const successSessions = sessions.filter(
    (session) =>
      !session.resultResult.includes("Warning") &&
      !session.resultResult.includes("Failed")
  );

  const getGroupedMessage = (groupSessions: Sessions[]) => {
    return groupSessions.map((session) => (
      <div key={session.id}>
        <p>
          <div className="">
            <span className="w-25 py-2 mx-1 fw-bold">{session.name}</span>
            <span className="flex-fill py-2 mx-1">{session.resultMessage}</span>
            <span className="flex-fill py-2 mx-1">{session.endTime}</span>
          </div>
        </p>
      </div>
    ));
  };

  return (
    <div>
      {failedSessions.length > 0 && (
        <div className="bg-danger border border-dark">
          <div>
            <span className="text-center">
              <h3>Failed Messages:</h3>
            </span>
            {getGroupedMessage(failedSessions)}
          </div>
        </div>
      )}

      {warningSessions.length > 0 && (
        <div className="bg-warning border border-dark">
          <div>
            <span className="text-center">
              <h3>Warning Messages:</h3>
            </span>
            {getGroupedMessage(warningSessions)}
          </div>
        </div>
      )}

      {failedSessions.length === 0 &&
        warningSessions.length === 0 &&
        successSessions.length > 0 && (
          <div className="bg-success border border-dark">
            <div className="text-center">
              <span className="text-center">
                <h3>Success Messages:</h3>
              </span>
              {getGroupedMessage(successSessions)}
            </div>
          </div>
        )}
    </div>
  );
};

export default StatusMessage;
