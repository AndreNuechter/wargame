const BIOMS = {
    ice: new Biom('ice', 'lightblue'),
    sea: new Biom('sea', 'blue'),
    desert: new Biom('desert', 'yellow'),
    grassland: new Biom('grassland', 'lightgreen'),
    forest: new Biom('forest', 'darkgreen'),
    mountains: new Biom('mountains', 'slategrey')
};

export default BIOMS;

function Biom(name, color) {
    return { name, color };
}

const styleSheet = window.document.styleSheets[0];

Object.values(BIOMS).forEach((biom) => {
    styleSheet.insertRule(
        `[data-biom="${biom.name}"] {
            .inner-cell {
                fill: ${biom.color};
            }
        }`
    );
});