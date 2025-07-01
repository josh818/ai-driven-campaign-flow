
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrendsChartProps {
  trendsData: any[];
}

const TrendsChart = ({ trendsData }: TrendsChartProps) => {
  const chartData = trendsData.reduce((acc: any[], item) => {
    const existingDate = acc.find(d => d.date === item.trend_date);
    if (existingDate) {
      existingDate[item.keyword] = item.interest_score;
    } else {
      acc.push({
        date: item.trend_date,
        [item.keyword]: item.interest_score
      });
    }
    return acc;
  }, []);

  const uniqueKeywords = [...new Set(trendsData.map(item => item.keyword))];

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-green-600" />
          <span>Keyword Popularity Trends</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            {uniqueKeywords.map((keyword, index) => (
              <Line
                key={keyword}
                type="monotone"
                dataKey={keyword}
                stroke={`hsl(${(index * 60) % 360}, 70%, 50%)`}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TrendsChart;
