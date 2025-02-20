import { useState, useEffect } from 'react';
import { Client, Databases, Query } from 'appwrite';
import './App.css';

function App() {
  const [aggregatedScores, setAggregatedScores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const client = new Client()
          .setEndpoint('https://cloud.appwrite.io/v1')
          .setProject('6749aac90038687908b7');
        const databases = new Databases(client);

        let teamScores: { [key: string]: number } = {};
        let offset = 0;
        const limit = 500; // Adjust the limit as needed
        let hasMore = true;

        while (hasMore) {
          const response = await databases.listDocuments(
            '6749aaef0034b73295d6',
            '679656b300020ec3e00b',
            [Query.orderAsc('timestamp'), Query.limit(limit), Query.offset(offset)]
          );

          console.log(`Fetched documents (offset ${offset}):`, response.documents);

          response.documents.forEach(doc => {
            const team = doc.team_name || 'Unknown';
            const points = Number(doc.points_awarded) || 0;
            teamScores[team] = (teamScores[team] || 0) + points;
          });

          offset += limit;
          hasMore = response.documents.length === limit;
        }

        console.log('Aggregated team scores:', teamScores);

        const aggregated = Object.entries(teamScores)
          .map(([team_name, score]) => ({ team_name, score }))
          .sort((a, b) => b.score - a.score);

        console.log('Final aggregated scores:', aggregated);

        setAggregatedScores(aggregated);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load leaderboard data');
        setIsLoading(false);
        console.error('Error:', err);
      }
    };
    fetchData();
  }, []);

  if (error) {
    return (
      <div className="app-container" role="alert">
        <h1 className="title">Error</h1>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <h1 className="title">Leaderboard</h1>
      <div className="table-container">
        <table className="leaderboard-table" role="table">
          <thead>
            <tr>
              <th scope="col" aria-sort="none">Rank</th>
              <th scope="col" aria-sort="none">Team Name</th>
              <th scope="col" aria-sort="descending">Points</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td><div className="skeleton" style={{ height: "24px" }} /></td>
                  <td><div className="skeleton" style={{ height: "24px" }} /></td>
                  <td><div className="skeleton" style={{ height: "24px" }} /></td>
                </tr>
              ))
            ) : (
              aggregatedScores.map((entry, index) => (
                <tr key={entry.team_name}>
                  <td aria-label="Rank">{index + 1}</td>
                  <td aria-label="Team Name">{entry.team_name}</td>
                  <td aria-label="Score">{entry.score.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default App
