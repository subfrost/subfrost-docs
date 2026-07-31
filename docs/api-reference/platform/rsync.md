---
title: Database Rsync Access
sidebar_label: Database Rsync
sidebar_position: 5
description: Business-tier rsync access to sync Esplora, Ord, Metashrew, and Bitcoin Core blockchain database snapshots directly.
---

# Database Rsync Access

Business customers can sync blockchain database snapshots directly using rsync, enabling fast node bootstrapping and data recovery.

## Overview

The Subfrost rsync service provides authenticated access to indexed blockchain data for:

- **Esplora**: Electrs blockchain index data
- **Ord**: Ordinals/Inscriptions index data
- **Metashrew**: indexer database
- **Bitcoind**: Bitcoin Core blockchain data

Available networks: `mainnet`, `signet`, `regtest`

## Authentication

Rsync access uses your Subfrost API key for authentication. The API key serves as both the username and password.

```bash
# Set your API key as the rsync password
export RSYNC_PASSWORD="your-api-key-here"

# Use the same API key as the username in the rsync URL
rsync -avz rsync://YOUR_API_KEY@rsyncd.subfrost.io/MODULE/ /local/path/
```

## Available modules

Modules are named using the format `{network}-{service}`:

### Mainnet

- **`mainnet-esplora`**: Electrs/Esplora index (~500GB)
- **`mainnet-ord`**: Ordinals index (~1TB)
- **`mainnet-metashrew`**: indexer database (~200GB)
- **`mainnet-bitcoind`**: Bitcoin Core data (~700GB)

### Signet

- **`signet-esplora`**: Electrs/Esplora index (~5GB)
- **`signet-ord`**: Ordinals index (~10GB)
- **`signet-metashrew`**: indexer database (~2GB)
- **`signet-bitcoind`**: Bitcoin Core data (~3GB)

### Regtest

- **`regtest-esplora`**: Electrs/Esplora index (~100MB)
- **`regtest-ord`**: Ordinals index (~200MB)
- **`regtest-metashrew`**: indexer database (~50MB)
- **`regtest-bitcoind`**: Bitcoin Core data (~100MB)

## List available modules

```bash
export RSYNC_PASSWORD="your-api-key"
rsync --list-only rsync://YOUR_API_KEY@rsyncd.subfrost.io/
```

## Basic usage

### Sync signet Metashrew database

```bash
export RSYNC_PASSWORD="YOUR_API_KEY"

rsync -avz --progress \
  rsync://YOUR_API_KEY@rsyncd.subfrost.io/signet-metashrew/ \
  /data/metashrew/
```

### Sync mainnet Ord index

```bash
export RSYNC_PASSWORD="YOUR_API_KEY"

rsync -avz --progress \
  rsync://YOUR_API_KEY@rsyncd.subfrost.io/mainnet-ord/ \
  /data/ord/
```

### Preview files (dry run)

```bash
rsync -avz --dry-run \
  rsync://YOUR_API_KEY@rsyncd.subfrost.io/signet-esplora/ \
  /data/esplora/
```

## Consistent snapshots

For databases that are actively being written to, use a multi-pass rsync approach to ensure consistency:

```bash
#!/bin/bash
# rsync-consistent.sh - Multi-pass rsync for consistent snapshots

API_KEY="your-api-key"
MODULE="mainnet-metashrew"
DEST="/data/metashrew"

export RSYNC_PASSWORD="$API_KEY"
RSYNC_URL="rsync://${API_KEY}@rsyncd.subfrost.io/${MODULE}/"

MAX_PASSES=10
pass=1

while [ $pass -le $MAX_PASSES ]; do
    echo "=== Pass $pass of $MAX_PASSES ==="

    # Run rsync and capture stats
    output=$(rsync -avz --stats "$RSYNC_URL" "$DEST/" 2>&1)
    echo "$output"

    # Check if any files were transferred
    transferred=$(echo "$output" | grep "Number of regular files transferred" | awk '{print $NF}')

    if [ "$transferred" = "0" ]; then
        echo "No changes detected. Snapshot is consistent."
        exit 0
    fi

    echo "Files changed: $transferred. Running another pass..."
    pass=$((pass + 1))
    sleep 2
done

echo "Warning: Max passes reached. Database may still be changing."
exit 1
```

## Recommended rsync options

```bash
rsync -avz \
  --progress \           # Show transfer progress
  --partial \            # Keep partial files for resume
  --partial-dir=.rsync-partial \  # Store partials in hidden dir
  --delete \             # Remove files not in source
  rsync://...
```

### For large transfers

```bash
rsync -avz \
  --progress \
  --partial \
  --bwlimit=100000 \     # Limit bandwidth to 100MB/s
  --timeout=3600 \       # 1 hour timeout
  rsync://...
```

## Docker integration

### Using in Kubernetes init container

```yaml
apiVersion: v1
kind: Pod
spec:
  initContainers:
    - name: sync-data
      image: alpine:3.19
      command:
        - sh
        - -c
        - |
          apk add --no-cache rsync
          export RSYNC_PASSWORD="${SUBFROST_API_KEY}"
          rsync -avz --progress \
            "rsync://${SUBFROST_API_KEY}@rsyncd.subfrost.io/signet-metashrew/" \
            /data/
      env:
        - name: SUBFROST_API_KEY
          valueFrom:
            secretKeyRef:
              name: subfrost-secrets
              key: api-key
      volumeMounts:
        - name: data
          mountPath: /data
  containers:
    - name: app
      # ... your application container
```

### Docker Compose example

```yaml
services:
  metashrew:
    image: your-app:latest
    volumes:
      - metashrew-data:/data
    depends_on:
      sync-data:
        condition: service_completed_successfully

  sync-data:
    image: alpine:3.19
    command: >
      sh -c "
        apk add --no-cache rsync &&
        export RSYNC_PASSWORD=$${SUBFROST_API_KEY} &&
        rsync -avz rsync://$${SUBFROST_API_KEY}@rsyncd.subfrost.io/signet-metashrew/ /data/
      "
    environment:
      - SUBFROST_API_KEY=${SUBFROST_API_KEY}
    volumes:
      - metashrew-data:/data

volumes:
  metashrew-data:
```

## Performance tips

1. **Use compression for remote syncs**: add `--compress` for WAN transfers
2. **Limit bandwidth if needed**: use `--bwlimit=KBPS` to avoid saturating your connection
3. **Resume interrupted transfers**: use `--partial --partial-dir=.rsync-partial`
4. **Exclude unnecessary files**: use `--exclude` patterns for files you don't need
5. **Consider incremental syncs**: after initial sync, subsequent syncs transfer only changes

## Troubleshooting

### Authentication failed

```
@ERROR: authentication failed
```

- Verify your API key is valid and has business access
- Ensure `RSYNC_PASSWORD` environment variable is set
- Check that the username in the URL matches your API key

### Connection refused

```
rsync: failed to connect to rsyncd.subfrost.io: Connection refused
```

- Check your network connectivity
- Verify DNS resolution: `dig rsyncd.subfrost.io`
- Ensure port 873 is not blocked by firewall

### Module not found

```
@ERROR: Unknown module 'invalid-module'
```

- Use `--list-only` to see available modules
- Verify module name format: `{network}-{service}`

## Rate limits

Rsync access is subject to your business plan limits:

- Concurrent connections per API key
- Bandwidth limits (if applicable)
- Access to specific networks/modules

Contact support for custom limits or additional access.

## Security considerations

- API keys used for rsync have the same permissions as HTTP API access
- All transfers are authenticated: no anonymous access
- Consider using separate API keys for rsync vs API access
- Rotate keys periodically, especially after sharing for one-time syncs
