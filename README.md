# LeRobot Dataset Visualizer

LeRobot Dataset Visualizer is a web application for interactive exploration and visualization of robotics datasets, particularly those in the LeRobot format. It enables users to browse, view, and analyze episodes from large-scale robotics datasets, combining synchronized video playback with rich, interactive data graphs.

## 🆕 S3 Support

**This project has been enhanced to support S3 data sources!**

- ✅ **Default S3 support**: Load datasets directly from S3 buckets
- ✅ **Private bucket support**: Uses AWS SDK with IAM roles (no public access needed)
- ✅ **HuggingFace compatibility**: Still supports HuggingFace datasets as an option
- ✅ **Easy configuration**: Switch between S3 and HuggingFace via environment variables

### Quick Start with S3

1. **Configure AWS credentials** (EC2 IAM role, AWS CLI, or environment variables)

2. **Set environment variables**:
```bash
cp .env.example .env.local
# Edit .env.local:
# NEXT_PUBLIC_USE_HUGGINGFACE=false
# NEXT_PUBLIC_S3_DATASET_PREFIX=s3://xlab-eks/datasets/
```

3. **Install and run**:
```bash
npm install
npm run dev
```

4. **Access the app** at http://localhost:3000 and enter a dataset ID like `m3/lerobot_so101_block2box`

📖 **For detailed instructions, see:**
- [USAGE_GUIDE.md](./USAGE_GUIDE.md) - Complete usage guide
- [S3_CONFIGURATION.md](./S3_CONFIGURATION.md) - S3 configuration details
- [MODIFICATIONS_SUMMARY.md](./MODIFICATIONS_SUMMARY.md) - Technical implementation details

## Project Overview

This tool is designed to help robotics researchers and practitioners quickly inspect and understand large, complex datasets. It fetches dataset metadata and episode data (including video and sensor/telemetry data), and provides a unified interface for:

- Navigating between organizations, datasets, and episodes
- Watching episode videos
- Exploring synchronized time-series data with interactive charts
- Paginating through large datasets efficiently

## Key Features

- **Dataset & Episode Navigation:** Quickly jump between organizations, datasets, and episodes using a sidebar and navigation controls.
- **Synchronized Video & Data:** Video playback is synchronized with interactive data graphs for detailed inspection of sensor and control signals.
- **Efficient Data Loading:** Uses parquet and JSON loading for large dataset support, with pagination and chunking.
- **Responsive UI:** Built with React, Next.js, and Tailwind CSS for a fast, modern user experience.
- **🆕 S3 Integration:** Seamlessly load datasets from private S3 buckets using server-side AWS SDK.
- **🆕 Flexible Data Sources:** Switch between S3 and HuggingFace with a simple configuration change.

## Technologies Used

- **Next.js** (App Router)
- **React**
- **Recharts** (for data visualization)
- **hyparquet** (for reading Parquet files)
- **Tailwind CSS** (styling)
- **🆕 AWS SDK v3** (for S3 access)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- AWS credentials (for S3 mode)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd lerobot-dataset-visualizer

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local as needed

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx` or other files in the `src/` directory. The app supports hot-reloading for rapid development.

### Environment Variables

#### S3 Mode (Default)
```bash
NEXT_PUBLIC_USE_HUGGINGFACE=false
NEXT_PUBLIC_S3_DATASET_PREFIX=s3://xlab-eks/datasets/
AWS_REGION=us-east-1
```

#### HuggingFace Mode
```bash
NEXT_PUBLIC_USE_HUGGINGFACE=true
DATASET_URL=https://huggingface.co/datasets  # optional
```

## Testing

Run the automated test script:

```bash
./test-s3-dataset.sh
```

This will verify:
- Environment configuration
- AWS credentials
- S3 dataset access
- API proxy functionality

## Documentation

- **[USAGE_GUIDE.md](./USAGE_GUIDE.md)** - Complete usage instructions
- **[S3_CONFIGURATION.md](./S3_CONFIGURATION.md)** - S3 setup and configuration
- **[MODIFICATIONS_SUMMARY.md](./MODIFICATIONS_SUMMARY.md)** - Technical details of modifications

## Contributing

Contributions, bug reports, and feature requests are welcome! Please open an issue or submit a pull request.

### Acknowledgement 
The app was originally created by [@Mishig25](https://github.com/mishig25) and taken from this PR [#1055](https://github.com/huggingface/lerobot/pull/1055)

S3 support added by extending the original implementation to work with private S3 buckets using Next.js API routes and AWS SDK.
