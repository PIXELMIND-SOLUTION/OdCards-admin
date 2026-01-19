const Dashboard = ({ darkMode }) => {
    return (
        <div className={`text-center text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Welcome to the Dashboard
        </div>
    );
}
export default Dashboard;