const { logger } = require('./logger');
const TodoModel = require('./db/models/todo');

function isPrime(number) {
    if (number <= 1) {
        return false;
    }
    if (number == 2 || number == 3) {
        return true;
    }
    let lim = Math.floor(Math.sqrt(number));
    for (let den = 2; den <= lim; den += 1) {
        if (number % den == 0) {
            return false;
        }
    }
    return true;
}

// reset table
TodoModel.sync({ force: true })
    .then(() => {
        for (let ix = 0; ix < 10; ix += 1) {
            let id = ix + 1;
            TodoModel.create({
                'title': 'TODO ' + id,
                'description': 'This is TODO #' + id + '.',
                'completed': isPrime(id),
            })
            .then(() => {
                logger.info('OKAY insert record for ' + id);
            })
            .catch((err) => {
                logger.error('FAIL insert record for ' + id);
            });
        }
    })
    .catch((err) => {
        logger.error('FAIL to reset TODO table');
    });
