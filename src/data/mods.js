export default {
    // One-time
    RAPID_FIRE: {
        name: 'Rapid Fire',
        description: 'Shoot automatically by holding down fire',
        stackable: false,
        appearIfLeadingBy: 2,
    },
    LASER_SIGHT: {
        name: 'Laser Sight',
        description: 'See where you\'re aiming',
        stackable: false,
        appearIfLeadingBy: 3,
    },
    SHOOT_THRU_WALLS: {
        name: 'Shoot Thru Walls',
        description: 'Shots go through the first wall they hit',
        stackable: false,
        appearIfLeadingBy: 4,
    },
    MOVE_THRU_WALLS: {
        name: 'Move Thru Walls',
        description; 'Move through walls (but don\'t stay in the wall too long!)',
        stackable: false,
        appearIfLeadingBy: 4,
    },
    RICOCHET: {
        name: 'Ricochet',
        description: 'Shots bounce off walls',
        stackable: false,
        appearIfLeadingBy: 3,
    },
    MOVING_RELOAD: {
        name: 'Moving Reload',
        description: 'Keep moving while reloading',
        stackable: false,
        appearIfLeadingBy: 3,
    },

    // Stackable
    EXTRA_AMMO: {
        name: 'Extra Ammo',
        description: 'Extra Ammo',
        stackable: 3,
        appearIfLeadingBy: 2,
    },
    FASTER_DASH: {
        name: 'Faster Dash',
        description: 'Get a faster boost when dashing',
        stackable: 3,
        appearIfLeadingBy: 2,
    },
    FASTER_MOVEMENT: {
        name: 'Faster Movement',
        description: 'Move faster',
        stackable: 3,
        appearIfLeadingBy: 2,
    },
    FASTER_PROJECTILES: {
        name: 'Faster Projectiles',
        description: 'Shoot faster moving projectiles',
        stackable: 3,
        appearIfLeadingBy: 2,
    },
    SHIELD: {
        name: 'Shield',
        description: 'Withstand an extra hit'
        stackable: 2,
        appearIfLeadingBy: 3,
    }
}
