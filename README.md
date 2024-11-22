# Framework

React + TypeScript + Vite + Eslint9 + Prettier

# Run

2. `npm i` nodejs >= 18
3. `npm run dev` run local project
4. `npm run build` build project

# Files

```
find src -type d | sed -e "s/[^-][^\/]*\//  │   /g" -e "s/│\([^ ]\)/├── \1/" -e "s/  │/│/" -e "s/│\s*$//" -e "s/^/    /" | sed "s/├── src/src/"
```

# Update dependency

`npx npm-check -u`

# [Https](https://github.com/FiloSottile/mkcert)

## Windows

`choco install mkcert`

## Mac

`brew install mkcert`

`brew install nss` # if you use Firefox

### Generate certificate

`mkcert localhost 127.0.0.1 ::1`

## enqueueSnackbar

```
 enqueueSnackbar("Do you want to confirm this action?", {
          variant: "info",
          autoHideDuration: 10000, // 10 seconds
          action: (key) => (
            <CommonButton
              color="inherit"
              size="xs"
              onClick={() => {
                // Handle confirmation action here
                console.log("Action confirmed");
                closeSnackbar(key);
              }}
            >
              Confirm
            </CommonButton>
          ),
        });
```

# ESlint rule check

```
 npx eslint .
```
