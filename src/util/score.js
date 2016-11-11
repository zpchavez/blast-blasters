import globalState from './global-state';

export default {
    /**
     * Get array of players who have met the number of points
     * required to win and who have more points than any other
     * players
     */
    getWinningPlayers()
    {
        const scoreToPlayers = {};

        globalState.get('score').forEach((score, player) => {
            if (! scoreToPlayers[score]) {
                scoreToPlayers[score] = [];
            }
            scoreToPlayers[score].push(player);
        });

        const sortedScores = globalState.get('score').sort((a, b) => a < b);
        let winningPlayers = [];
        sortedScores.forEach(score => {
            if (winningPlayers.length === 0 && score >= this.getWinningScore()) {
                winningPlayers = scoreToPlayers[score];
            }
        });

        return winningPlayers;
    },

    getNonWinningPlayers()
    {
        const nonWinningPlayers = [];
        const winningPlayers = this.getWinningPlayers();
        globalState.get('score').forEach((score, player) => {
            if (winningPlayers.indexOf(player) === -1) {
                nonWinningPlayers.push(player);
            }
        });

        return nonWinningPlayers;
    },

    getWinningScore()
    {
        return globalState.get('players') * 5;
    }
};
