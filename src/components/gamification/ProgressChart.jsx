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

// Arcade HUD chart palette: two cyan shades (Score/Income) + Vice Pink (Rank)
// so the three series stay distinguishable without leaving the two-channel family.
const HUD_BLUE = 'rgb(41, 210, 227)';
const HUD_BLUE_LIGHT = 'rgb(140, 232, 240)';
const HUD_PINK = 'rgb(255, 0, 127)';
const AXIS_MUTED = 'rgb(131, 153, 180)';
const GRID_MUTED = 'rgba(131, 153, 180, 0.12)';

const ProgressChart = ({ history }) => {
  if (!history || history.length < 2) {
    return (
      <EmptyState
        icon="📈"
        title="Not enough history yet"
        description="Complete at least 2 assessments to see your progress over time. Come back tomorrow!"
        action={
          <div className="flex items-center gap-2 text-hud-blue text-sm mt-2">
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
        borderColor: HUD_BLUE,
        backgroundColor: 'rgba(41, 210, 227, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Income ($/hr ÷ 10k)',
        data: history.map(h => h.incomePerHour / 10000),
        borderColor: HUD_BLUE_LIGHT,
        backgroundColor: 'rgba(140, 232, 240, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Rank',
        data: history.map(h => h.rank),
        borderColor: HUD_PINK,
        backgroundColor: 'rgba(255, 0, 127, 0.1)',
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
          color: AXIS_MUTED,
          font: {
            size: 11,
            weight: 'bold',
          },
        },
      },
      title: {
        display: true,
        text: 'Progress Over Time',
        color: 'rgb(230, 238, 247)',
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
          color: AXIS_MUTED,
        },
        ticks: {
          color: AXIS_MUTED,
        },
        grid: {
          color: GRID_MUTED,
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Rank',
          color: AXIS_MUTED,
        },
        ticks: {
          color: AXIS_MUTED,
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        ticks: {
          color: AXIS_MUTED,
        },
        grid: {
          color: GRID_MUTED,
        },
      },
    },
  };

  return (
    // contain-paint contain-layout: isolates the Chart.js canvas's own render
    // cycle from the rest of the results view.
    <div className="contain-paint contain-layout" style={{ height: '300px' }}>
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
