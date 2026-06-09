# Umwero Font Directory

Place the Umwero font file here as `umwero.ttf`.

The font file should be a TrueType font (.ttf) containing all Umwero alphabet characters.

## Configuration

Set the `UMWERO_FONT_PATH` environment variable to point to your font file:

```bash
export UMWERO_FONT_PATH=/path/to/fonts/umwero.ttf
```

Or use the default path: `fonts/umwero.ttf`

## Fallback Behavior

If the font file is not found, the service will:
1. Log a warning
2. Use a placeholder rendering system
3. Continue to operate with reduced functionality

For production deployment, ensure the Umwero font is properly installed.
