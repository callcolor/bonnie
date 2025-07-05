A Second Life bot enabling text-to-speech applications. 

Let us know which "Bonnie" features you'd like us to release next!

# Running your own Bonnie (TTS) instance

Account with free sound clip uploads highly recommended!

Install Podman
https://podman.io/docs/installation

Setup Podman Compose
https://stackoverflow.com/a/78396855

Copy the example config file and edit it to your needs.
`cp config.example.ts config.ts`

Start a postgres database with Podman
`podman compose up -d`

Build and run the Bonnie application
`podman build -t bonnie .`
`podman run --name bonnie bonnie`

Remove container
`podman rm -f bonnie`
