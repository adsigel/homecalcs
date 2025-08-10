# HomeCalcs

A collection of financial calculator tools designed for homeowners to make informed decisions about their properties.

## Features

- **PITI Calculator**: Calculate monthly mortgage payments including Principal, Interest, Taxes, and Insurance
- **PMI Support**: Automatic PMI calculations for down payments less than 20%
- **Shared Inputs**: Common property data shared across all calculators
- **Real-time Validation**: Input validation with helpful error messages
- **Amortization Schedule**: View the first 12 months of your loan breakdown
- **Local Storage**: Your data is automatically saved in your browser

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd homecalcs
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Usage

1. **Enter Property Details**: Fill in the left panel with your property information
2. **View PITI Results**: See your monthly payment breakdown in real-time
3. **Check PMI**: If your down payment is less than 20%, PMI will be automatically calculated
4. **Review Amortization**: View how your payments are applied to principal vs. interest

## Architecture

- **Frontend**: Next.js 14 with React 18
- **Styling**: Tailwind CSS with custom component classes
- **Icons**: Lucide React for consistent iconography
- **State Management**: React hooks with localStorage persistence
- **Type Safety**: Full TypeScript support

## Future Calculators

- DSCR Eligibility Calculator
- Refinance Calculator
- Home Improvement ROI Calculator
- Property Tax Assessment Calculator

## Contributing

This is a personal project, but suggestions and improvements are welcome!

## License

MIT License 