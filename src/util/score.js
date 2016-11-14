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

        const sortedScores = this.getSortedScores();
        let winningPlayers = [];
        sortedScores.forEach(score => {
            if (winningPlayers.length === 0 && score >= this.getWinningScore()) {
                winningPlayers = scoreToPlayers[score];
            }
        });

        return winningPlayers;
    },

    /**
     * Return scores sorted highest to lowers
     */
    getSortedScores()
    {
        return globalState.get('score').slice(0).sort((a, b) => a < b);
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

    getLead()
    {
        const sortedScores = this.getSortedScores();
        return sortedScores[0] - sortedScores[1];
    },

    getLeadingPlayer()
    {
        const lead = this.getLead();
        if (lead === 0) {
            return null;
        }

        const sortedScores = this.getSortedScores();
        return globalState.get('score').indexOf(sortedScores[0]);
    },

    getNonLeadingPlayers()
    {
        const nonLeadingPlayers = [];
        const leadingPlayer = this.getLeadingPlayer();
        globalState.get('score').forEach((score, player) => {
            if (leadingPlayer !== player) {
                nonLeadingPlayers.push(player);
            }
        });

        return nonLeadingPlayers;
    },

    getWinningScore()
    {
        return globalState.get('players') * 5;
    }
};
