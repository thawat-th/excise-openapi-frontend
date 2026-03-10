import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI"',
  				'Roboto',
  				'Oxygen',
  				'Ubuntu',
  				'Cantarell',
  				'Fira Sans"',
  				'Droid Sans"',
  				'Helvetica Neue"',
  				'sans-serif'
  			]
  		},
  		fontSize: {
  			'xs': ['0.75rem', { lineHeight: '1rem' }],        // 12px
  			'sm': ['0.875rem', { lineHeight: '1.25rem' }],    // 14px
  			'base': ['1rem', { lineHeight: '1.5rem' }],       // 16px (default body text)
  			'lg': ['1.125rem', { lineHeight: '1.75rem' }],    // 18px
  			'xl': ['1.375rem', { lineHeight: '1.875rem' }],   // 22px (h5 - matching Excise systems)
  			'2xl': ['1.5rem', { lineHeight: '2rem' }],        // 24px (h4)
  			'3xl': ['1.875rem', { lineHeight: '2.25rem' }],   // 30px (h3)
  			'4xl': ['2.25rem', { lineHeight: '2.5rem' }],     // 36px (h2)
  			'5xl': ['3rem', { lineHeight: '1' }],             // 48px (h1)
  			'6xl': ['3.75rem', { lineHeight: '1' }],          // 60px
  			'7xl': ['4.5rem', { lineHeight: '1' }],           // 72px
  		},
  		colors: {
  			excise: {
  				'50': '#f8f8f8',
  				'100': '#e8e9e8',
  				'200': '#d1d2d1',
  				'300': '#b2b4b2',
  				'400': '#999b99',
  				'500': '#7f817f',
  				'600': '#666766',
  				'700': '#4d4e4d',
  				'800': '#333433',
  				'900': '#1a1a1a'
  			},
  			primary: {
  				'50': '#e5f1fe',
  				'100': '#cce4fe',
  				'200': '#99cafe',
  				'300': '#67b0fd',
  				'400': '#3496fd',
  				'500': '#017cfd',
  				'600': '#0163ca',
  				'700': '#014a97',
  				'800': '#003165',
  				'900': '#001832',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			accent: {
  				'50': '#fff9ed',
  				'100': '#fef0d1',
  				'200': '#fdde9f',
  				'300': '#fcc76d',
  				'400': '#fbb034',
  				'500': '#f39b0f',
  				'600': '#d77c0a',
  				'700': '#b35f0c',
  				'800': '#914a11',
  				'900': '#773d11',
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			brand: {
  				'50': '#e8f1f9',
  				'100': '#d0e4f3',
  				'200': '#a1c8e6',
  				'300': '#72add9',
  				'400': '#4391cc',
  				'500': '#0975bf',
  				'600': '#0865a3',
  				'700': '#004c97',
  				'800': '#003a73',
  				'900': '#00284f'
  			},
  			gold: {
  				'50': '#fffbf4',
  				'100': '#fef7e8',
  				'200': '#fdead0',
  				'300': '#fcdfb8',
  				'400': '#fbb034',
  				'500': '#fab02d',
  				'600': '#f5a020',
  				'700': '#f09014',
  				'800': '#da7c0d',
  				'900': '#c26809'
  			},
  			gray: {
  				'50': '#fafaf9',
  				'100': '#f5f5f4',
  				'200': '#e7e5e4',
  				'300': '#d3cfd0',
  				'400': '#b2b4b2',
  				'500': '#9b9d9b',
  				'600': '#868886',
  				'700': '#6f7170',
  				'800': '#58595a',
  				'900': '#414243'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
