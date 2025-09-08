import Statistics from '../components/Statistics';

const StatsPage = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          URL Analytics Dashboard
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover insights into your shortened URLs performance and track engagement metrics.
        </p>
      </div>

      {/* Statistics Component */}
      <Statistics />
    </div>
  );
};

export default StatsPage;