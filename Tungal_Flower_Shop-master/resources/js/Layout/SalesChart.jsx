import React from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function SalesChart({ topSellingProducts }) {
    if (!topSellingProducts || topSellingProducts.length === 0) {
        return <p>Loading chart...</p>;
    }

    const shortenLabel = (label) => {
        if (!label) return 'Unknown';
        return label.length > 14 ? `${label.slice(0, 14)}...` : label;
    };

    const data = {
        labels: topSellingProducts.map((item) => shortenLabel(item.product?.product_name)),
        datasets: [
            {
                label: "Sales",
                data: topSellingProducts.map((item) => Number(item.total_sales)),
                backgroundColor: "rgba(109, 120, 227, 0.82)",
                borderColor: "rgba(109, 120, 227, 1)",
                borderWidth: 1,
                borderRadius: 8,
                maxBarThickness: 38,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 4,
                right: 8,
                bottom: 0,
                left: 4,
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    title: (context) => {
                        const index = context[0].dataIndex;
                        return topSellingProducts[index]?.product?.product_name || 'Unknown';
                    },
                    label: (context) => `Sales: ₱${Number(context.raw).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    maxRotation: 0,
                    minRotation: 0,
                    autoSkip: false,
                    font: { size: 11 },
                },
            },
            y: {
                beginAtZero: true,
                title: { display: true, text: "Sales Amount" },
                ticks: {
                    callback: (value) => `₱${Number(value).toLocaleString('en-US')}`,
                    font: { size: 11 },
                },
            },
        },
    };

    return (
        <div className="w-100 h-100">
            <Bar data={data} options={options} />
        </div>
    );
}

