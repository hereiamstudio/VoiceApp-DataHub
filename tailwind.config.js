const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
    content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/line-clamp'),
        require('tailwindcss-animation-delay')
    ],
    theme: {
        extend: {
            animation: {
                'fade-in': 'fadeIn 0.6s'
            },
            fontFamily: {
                sans: ['Inter var', ...defaultTheme.fontFamily.sans]
            },
            keyframes: {
                fadeIn: {
                    '0%': {opacity: 0},
                    '100%': {opacity: 1}
                }
            },
            maxHeight: {
                '70vh': '70vh'
            }
        }
    },
    variants: {
        extend: {}
    }
};
