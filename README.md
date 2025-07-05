# Running your own Bonnie (TTS) instance

Install Podman
https://podman.io/docs/installation

Copy the example config file and edit it to your needs.
`cp config.example.ts config.ts`

Start a postgres database with Podman
`podman compose up -d`

Build and run the Bonnie application
`podman build -t bonnie .`
`podman run --name bonnie bonnie`

Remove container
`podman rm -f bonnie`
