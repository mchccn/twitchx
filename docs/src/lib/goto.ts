export default function goto(to: string) {
    if (
        !/\?scrollTo=.+$/.test(window.location.hash) ||
        /\?scrollTo=(.+)$/.exec(window.location.hash)?.[0] !== to.toLowerCase()
    ) {
        window.location.hash = window.location.hash.split("?")[0] + `?scrollTo=${to.toLowerCase()}`;
    }
}
