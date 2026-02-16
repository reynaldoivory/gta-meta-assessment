// src/components/ProgressChart.jsx
import PropTypes from 'prop-types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp } from 'lucide-react';
import EmptyState from '../shared/EmptyState';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ProgressChart = ({ history }) => {
  if (!history || history.length < 2) {
    return (
      <EmptyState
        icon="📈"
        title="Not enough data yet"
        description="Complete at least 2 assessments to see your progress over time. Come back tomorrow!"
        action={
          <div className="flex items-center gap-2 text-blue-400 text-sm mt-2">
            <TrendingUp className="w-4 h-4" />
            <span>First assessment completed!</span>
          </div>
        }
      />
    );
  }

  const labels = history.map(h =>
    new Date(h.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );

  const data = {
    labels,
    datasets: [
      {
        label: 'Score',
        data: history.map(h => h.score),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Income ($/hr ÷ 10k)',
        data: history.map(h => h.incomePerHour / 10000),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Rank',
        data: history.map(h => h.rank),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgb(203, 213, 225)',
          font: {
            size: 11,
            weight: 'bold',
          },
        },
      },
      title: {
        display: true,
        text: 'Progress Over Time',
        color: 'rgb(241, 245, 249)',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Score / Income (÷10k)',
          color: 'rgb(148, 163, 184)',
        },
        ticks: {
          color: 'rgb(148, 163, 184)',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Rank',
          color: 'rgb(148, 163, 184)',
        },
        ticks: {
          color: 'rgb(148, 163, 184)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        ticks: {
          color: 'rgb(148, 163, 184)',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Line data={data} options={options} />
    </div>
  );
};

ProgressChart.propTypes = {
  history: PropTypes.arrayOf(
    PropTypes.shape({
      timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      score: PropTypes.number.isRequired,
      incomePerHour: PropTypes.number.isRequired,
      rank: PropTypes.number.isRequired,
    })
  ),
};

export default ProgressChart;
