// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title  CitationRegistry
 * @notice Immutable, on-chain registry for human–AI intellectual collaborations.
 *         Each citation is sealed under a deterministic, human-readable code
 *         (e.g. "BC-SD-20260619-01") and binds an IPFS CID to a wallet author
 *         and a block timestamp. Once a code is registered it can never be
 *         overwritten — this is the core guarantee of the Sıfır Düşüş Protocol.
 *
 * @dev    Gas-optimized: single SSTORE-heavy path on register, custom errors
 *         instead of revert strings, calldata args, and a packed struct.
 */
contract CitationRegistry {
    // ─── Types ──────────────────────────────────────────────────────────────

    struct Citation {
        string sourceRef;   // free-form bibliographic reference / work title
        string ipfsCID;     // immutable content identifier of the sealed dialogue
        uint256 timestamp;  // block.timestamp at the moment of sealing
        address author;     // wallet that sealed the citation
        bool isRegistered;  // existence flag (false for unknown codes)
    }

    // ─── Storage ────────────────────────────────────────────────────────────

    mapping(string => Citation) private _registry;

    uint256 public totalCitations;

    // ─── Events ─────────────────────────────────────────────────────────────

    event CitationRegistered(
        string indexed code,
        address indexed author,
        string ipfsCID,
        uint256 timestamp
    );

    // ─── Custom errors (cheaper than require strings) ───────────────────────

    /// @dev Thrown when a code already maps to a registered citation.
    error CitationAlreadyExists(string code);
    /// @dev Thrown when a lookup targets a code that was never registered.
    error CitationNotFound(string code);
    /// @dev Thrown when a required string argument is empty.
    error EmptyField(string field);

    // ─── Mutating functions ─────────────────────────────────────────────────

    /**
     * @notice Permanently seal a citation under a deterministic code.
     * @param _code      Human-readable deterministic code (unique key).
     * @param _sourceRef Bibliographic reference of the host work.
     * @param _ipfsCID   IPFS CID pointing to the sealed dialogue JSON.
     *
     * Reverts with {CitationAlreadyExists} if the code is already taken —
     * existing deterministic citation codes can never be overwritten.
     */
    function registerCitation(
        string calldata _code,
        string calldata _sourceRef,
        string calldata _ipfsCID
    ) external {
        if (bytes(_code).length == 0) revert EmptyField("code");
        if (bytes(_ipfsCID).length == 0) revert EmptyField("ipfsCID");

        Citation storage existing = _registry[_code];
        if (existing.isRegistered) revert CitationAlreadyExists(_code);

        _registry[_code] = Citation({
            sourceRef: _sourceRef,
            ipfsCID: _ipfsCID,
            timestamp: block.timestamp,
            author: msg.sender,
            isRegistered: true
        });

        unchecked {
            ++totalCitations;
        }

        emit CitationRegistered(_code, msg.sender, _ipfsCID, block.timestamp);
    }

    // ─── View functions ─────────────────────────────────────────────────────

    /**
     * @notice Resolve a citation by its deterministic code.
     * @dev    Reverts with {CitationNotFound} when the code is unknown so that
     *         clients can distinguish "never sealed" from a zeroed struct.
     */
    function getCitation(string calldata _code)
        external
        view
        returns (
            string memory sourceRef,
            string memory ipfsCID,
            uint256 timestamp,
            address author,
            bool isRegistered
        )
    {
        Citation storage c = _registry[_code];
        if (!c.isRegistered) revert CitationNotFound(_code);
        return (c.sourceRef, c.ipfsCID, c.timestamp, c.author, c.isRegistered);
    }

    /**
     * @notice Non-reverting existence check, convenient for deterministic-code
     *         collision avoidance on the client before attempting to seal.
     */
    function exists(string calldata _code) external view returns (bool) {
        return _registry[_code].isRegistered;
    }
}
