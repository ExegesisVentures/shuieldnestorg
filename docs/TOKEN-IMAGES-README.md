# Token Images Guide

## Directory
All token images are stored in `/public/tokens/`

## Required Images

Add SVG or PNG files for these tokens:

| Token | Filename | Status |
|-------|----------|--------|
| CORE | `core.svg` | ⏳ Needed |
| DROP | `drop.svg` | ⏳ Needed |
| AWKT | `awkt.svg` | ⏳ Needed |
| COZY | `cozy.svg` | ⏳ Needed |
| KONG | `kong.svg` | ⏳ Needed |
| MART | `mart.svg` | ⏳ Needed |
| XRP | `xrp.svg` | ⏳ Needed |
| ULP | `ulp.svg` | ⏳ Needed |

## Image Specifications

- **Format**: SVG preferred (PNG as fallback)
- **Size**: 48x48px minimum, scalable
- **Background**: Transparent
- **Colors**: Use brand colors for each token
- **Naming**: Lowercase, match the token symbol

## Where to Get Images

1. **Official Sources**:
   - Token project websites
   - Official brand guidelines
   - GitHub repositories

2. **Fallback**:
   - Create simple circular icons with first letter
   - Use brand color gradients
   - Ensure they match the app's design system

## Adding New Tokens

1. Add token metadata to `utils/coreum/token-registry.ts`
2. Add image to `public/tokens/{symbol}.svg`
3. Update this README with status

## Notes

- ULP = Universal Liquidity Pool token (DEX LP token)
- XRP is wrapped XRP on Coreum (uses 6 decimals, not 8)

