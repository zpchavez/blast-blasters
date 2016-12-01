import queryString from 'query-string';

const queryOptions = queryString.parse(window.location.search);

const mods = {
    BLAST_BOUNCE: {
        name: 'Blast Bounce',
        description: 'Blasts bounce off walls. Bonus: Limited selfie immunity.',
        maxLevel: 3,
    },
    AMMO_BLAMMO: {
        name: 'Ammo Blammo',
        description: 'Longer lasting consecutive blasting (more ammo)',
        maxLevel: 3,
    },
    FASTER_RELOAD: {
        name: 'Faster Reload',
        description: 'Reload faster',
        maxLevel: 3,
    },
    FASTER_BLASTER: {
        name: 'Faster Blaster',
        description: 'Blasts go faster',
        maxLevel: 3
    },
    JUST_PLAIN_FASTER: {
        name: 'Just Plain Faster',
        description: 'Move faster',
        maxLevel: 3,
    },
    AUTO_BLASTER: {
        name: 'Auto Blaster',
        description: 'Hold down blast to auto-blast',
        maxLevel: 1,
    },
    DASH_RECOVERY: {
        name: `Dash Recovery`,
        description: `Don't slow down as much. Dash again sooner.`,
        maxLevel: 3,
    },
    SHIELD: {
        name: 'Shield',
        description: 'Withstand an extra blast',
        maxLevel: 3,
    },
};

if (typeof queryOptions.experimental !== 'undefined') {
    Object.assign(mods, {
        FIREWORKS: {
            name: 'Fireworks',
            description: 'Blasts burst like fireworks',
            maxLevel: 1,
        },
    });
}

export default mods;
