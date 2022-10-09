// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '_app/shared/button';
import CardLayout from '_app/shared/card-layout';
import Alert from '_components/alert';
import CopyToClipboard from '_components/copy-to-clipboard';
import Icon, { SuiIcons } from '_components/icon';
import Loading from '_components/loading';
import { useAppDispatch } from '_hooks';
import { loadMnemonicFromKeyring } from '_redux/slices/account';

import st from './Backup.module.scss';

export type BackupPageProps = {
    mode?: 'created' | 'imported';
};

const BackupPage = ({ mode = 'created' }: BackupPageProps) => {
    const [loading, setLoading] = useState(true);
    const [mnemonic, setLocalMnemonic] = useState<string | null>(null);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    useEffect(() => {
        // TODO: this assumes that the Keyring in bg service is unlocked. It should be fix
        // when we add a locked status guard. (#encrypt-wallet)
        (async () => {
            if (mode !== 'created') {
                return;
            }
            setLoading(true);
            try {
                setLocalMnemonic(
                    await dispatch(loadMnemonicFromKeyring({})).unwrap()
                );
            } catch (e) {
                // Do nothing
            } finally {
                setLoading(false);
            }
        })();
    }, [dispatch, mode]);
    return (
        <CardLayout
            icon="success"
            title={`Wallet ${
                mode === 'imported' ? 'Imported' : 'Created'
            } Successfully!`}
            subtitle={mode === 'created' ? 'Recovery Phrase' : undefined}
        >
            {mode === 'created' ? (
                <>
                    <Loading loading={loading}>
                        {mnemonic ? (
                            <div className={st.mnemonic}>
                                {mnemonic}
                                <CopyToClipboard
                                    txt={mnemonic}
                                    className={st.copy}
                                    mode="plain"
                                >
                                    COPY
                                </CopyToClipboard>
                            </div>
                        ) : (
                            <Alert>
                                Something is wrong, Recovery Phrase is empty.
                            </Alert>
                        )}
                    </Loading>
                    <div className={st.info}>
                        Your recovery phrase makes it easy to back up and
                        restore your account.
                    </div>
                    <div className={st.info}>
                        <div className={st.infoCaption}>WARNING</div>
                        Never disclose your secret recovery phrase. Anyone with
                        the passphrase can take over your account forever.
                    </div>
                </>
            ) : null}
            <div className={st.fill} />
            <Button
                type="button"
                className={st.btn}
                size="large"
                mode="primary"
                onClick={() => navigate('/')}
            >
                Open Sui Wallet
                <Icon icon={SuiIcons.ArrowLeft} className={st.arrowUp} />
            </Button>
        </CardLayout>
    );
};

export default BackupPage;
